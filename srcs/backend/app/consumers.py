import json
import asyncio
import requests
from django.http import JsonResponse
from django.core.cache import cache
from django.core.exceptions import ObjectDoesNotExist
from channels.generic.websocket import AsyncWebsocketConsumer, JsonWebsocketConsumer
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async, async_to_sync
from .models import Game, User, Channel, Messages, TournamentGame, Tournament, TournamentPlayer

active_users = {}

async def insert_winner_in_next_match(tournament_id, game, winner):
	current_tg = await sync_to_async(TournamentGame.objects.get)(
		tournament_id=tournament_id, game=game
	)
	current_round = current_tg.round_number

	# Récupérer tous les matchs du round actuel
	current_round_games = await sync_to_async(list)(
		TournamentGame.objects.filter(
			tournament_id=tournament_id,
			round_number=current_round
		).order_by("id")
	)
	index_in_round = current_round_games.index(current_tg)

	# Récupérer les matchs du round suivant
	next_round_games = await sync_to_async(list)(
		TournamentGame.objects.filter(
			tournament_id=tournament_id,
			round_number=current_round + 1
		).order_by("id")
	)
	if not next_round_games:
		print("🏆 Tournoi terminé ! Aucun tour suivant.")
		return

	target_game = next_round_games[index_in_round // 2]
	game_to_update = await sync_to_async(lambda: target_game.game)()

	player1 = await sync_to_async(lambda: game_to_update.player1)()
	player2 = await sync_to_async(lambda: game_to_update.player2)()

	if player1 == winner or player2 == winner:
		print(f"⚠️ {winner.username} est déjà dans ce match.")
		return

	if not player1:
		game_to_update.player1 = winner
	elif not player2:
		game_to_update.player2 = winner
	else:
		print("⚠️ Le match suivant est déjà rempli.")

	await sync_to_async(game_to_update.save)()
	
	if winner:
		print(f"\n\nThe winner is: {winner} ({winner.username}) with a score of {game.score_player1} - {game.score_player2})\n\n")
	else:
		print(f"\n\n⚠️ Match nul avec un score de {game.score_player1} - {game.score_player2}\n\n")


class GameConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		self.game_id = self.scope['url_route']['kwargs']['game_id']
		self.game_group_name = f'game_{self.game_id}'
		self.timer_task = None
		try:
			self.game = await sync_to_async(Game.objects.get)(id=self.game_id)
			self.player1 = await sync_to_async(lambda: self.game.player1)()
			self.player2 = await sync_to_async(lambda: self.game.player2)()
		except Game.DoesNotExist:
			await self.close()
			return

		if self.game.is_active == False:
			await self.close()
			return

		if self.scope['user'].is_anonymous or self.scope['user'] not in [self.player1, self.player2]:
			await self.close()
		else:
			await self.channel_layer.group_add(
					self.game_group_name,
					self.channel_name
					)
			await self.accept()
			await self.send(text_data=json.dumps({
				"type": "game_state",
				"player1_y": self.game.player1_y,
				"player2_y": self.game.player2_y,
				"ball_x": self.game.ball_x,
				"ball_y": self.game.ball_y,
				"score_player1": self.game.score_player1,
				"score_player2": self.game.score_player2,
				"speed": self.game.speed,
				"maxScore": self.game.maxScore,
				}))

	async def disconnect(self, close_code):
		self.game.is_active = False
		await sync_to_async(self.game.save)()

		await self.channel_layer.group_discard(
				self.game_group_name,
				self.channel_name
				)

	async def receive(self, text_data):
		data = json.loads(text_data)
		message_type = data.get("type")

		if message_type == "set_maxScore_success":
			await self.set_maxScore(data)
		elif message_type == "set_speed_success":
			await self.set_speed(data)
		elif message_type == "update_maxScore":
			await self.update_maxScore(data)
		elif message_type == "update_speed":
			await self.update_speed(data)
		elif message_type == "move":
			await self.handle_move(data)
		elif message_type == "ball":
			await self.handle_ball_position(data)
		elif message_type == "score":
			await self.handle_score_update(data)
		elif message_type == "pause":
			await self.handle_pause(data)
		elif message_type == "end":
			await self.end_game(data)

	async def set_maxScore(self, data):
		maxScore_value = data.get("maxScore")
		self.game.maxScore = maxScore_value
		await sync_to_async(self.game.save)()
		# Diffuser le speed aux deux joueurs
		await self.channel_layer.group_send(
				self.game_group_name,
				{
					"type": "update_maxScore",
					"maxScore": maxScore_value,
					}
				)
		print("Lancement de la tâche du maxScore...")

	async def set_speed(self, data):
		speed_value = data.get("speed")
		self.game.speed = speed_value
		await sync_to_async(self.game.save)()
		# Diffuser le speed aux deux joueurs
		await self.channel_layer.group_send(
				self.game_group_name,
				{
					"type": "update_speed",
					"speed": speed_value,
					}
				)
		print("Lancement de la tâche du speed...")

	async def update_speed(self, event):
		await self.send(text_data=json.dumps({
			"type": "update_speed",
			"speed": event['speed'],
			}))

	async def update_maxScore(self, event):
		await self.send(text_data=json.dumps({
			"type": "update_maxScore",
			"maxScore": event['maxScore'],
			}))

	async def handle_move(self, data):
		new_position = data.get("position")
		targetPlayer = data.get("player")

		await sync_to_async(self.game.save)()
		await self.channel_layer.group_send(
				self.game_group_name,
				{
					"type": "update_position",
					"player": targetPlayer,
					"position": new_position,
					}
				)
		# print("target player: ", targetPlayer)

	async def handle_ball_position(self, data):
		self.game.ball_x = data.get("ball_x")
		self.game.ball_y = data.get("ball_y")

		await sync_to_async(self.game.save)()

		await self.channel_layer.group_send(
				self.game_group_name,
				{
					"type": "update_ball_position",
					"ball_x": self.game.ball_x,
					"ball_y": self.game.ball_y,
					}
				)

	async def handle_score_update(self, data):
		self.game.score_player1 = data.get("score_player1", self.game.score_player1)
		self.game.score_player2 = data.get("score_player2", self.game.score_player2)

		await sync_to_async(self.game.save)(update_fields=["score_player1", "score_player2"])

		await self.channel_layer.group_send(
				self.game_group_name,
				{
					"type": "update_game_score",
					"score_player1": self.game.score_player1,
					"score_player2": self.game.score_player2
					}
				)

	async def handle_pause(self, data):
		self.game.is_paused = bool(data.get("is_paused", False))
		await sync_to_async(self.game.save)()

		await self.channel_layer.group_send(
				self.game_group_name,
				{
					"type": "update_pause",
					"is_paused": self.game.is_paused
					}
				)

	async def end_game(self, data):
		self.game.is_active = False
		self.game.is_ended = True
		self.game.score_player1 = data.get("score_player1", self.game.score_player1)
		self.game.score_player2 = data.get("score_player2", self.game.score_player2)

		if self.game.mode == "tournament":
			try:
				tournament_game = await sync_to_async(TournamentGame.objects.select_related('tournament').get)(game=self.game)
				tournament_id = tournament_game.tournament.id
			except TournamentGame.DoesNotExist:
				print("❌ ERREUR: Aucun tournoi trouvé pour ce match.")
				return
			
			print(f"🏆 Match {self.game.id} lié au tournoi {tournament_id}")

			if self.game.score_player1 > self.game.score_player2:
				winner = self.player1
			elif self.game.score_player2 > self.game.score_player1:
				winner = self.player2
			else:
				winner = None

			print(f"\n\nThe winner is: {winner} ({winner.username}) with a score of {self.game.score_player1} - {self.game.score_player2})\n\n")

			if winner:
				await insert_winner_in_next_match(tournament_id, self.game, winner)

			payload = {
					"tournamentid": tournament_id,
					"player1": {
						"id": self.game.player1.id,
						"username": self.game.player1.username
					} if self.game.player1 else None,
					"player2": {
						"id": self.game.player2.id,
						"username": self.game.player2.username
					} if self.game.player2 else None,
					"score1": self.game.score_player1,
					"score2": self.game.score_player2,
					"date": str(self.game.created_at)
				}

			try:
				response = requests.post(
						"http://blockchain-node:3000/add-match", 
						json=payload,  # Send as JSON
						headers={"Content-Type": "application/json"}
						)

				# return JsonResponse(response.json())
			except Exception as e:
				print(f"❌ ERREUR: Impossible d'ajouter le match au tournoi: {e}")

		await sync_to_async(self.game.save)(update_fields=["score_player1", "score_player2", "is_active", "is_ended"])

		await self.channel_layer.group_send(
				self.game_group_name,
				{ "type": "game_over" }
				)

		await asyncio.sleep(5)
		await self.channel_layer.group_discard(
				self.game_group_name,
				self.channel_name
				)

		await self.close()

	async def update_position(self, event):
		await self.send(text_data=json.dumps(event))

	async def update_ball_position(self, event):
		await self.send(text_data=json.dumps(event))

	async def update_game_score(self, event):
		await self.send(text_data=json.dumps(event))

	async def update_pause(self, event):
		await self.send(text_data=json.dumps(event))

	async def game_over(self, event):
		try:
			await self.send(text_data=json.dumps(event))
		except Exception as e:
			print(f"Error sending game over message: {e}")
			pass

class MatchConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		self.tournament_id = self.scope['url_route']['kwargs']['tournament_id']
		self.match_id = self.scope['url_route']['kwargs']['match_id']
		self.room_group_name = f'tournament_{self.tournament_id}_match_{self.match_id}'

		user = self.scope['user']
		try:
			# Récupérer le jeu de manière asynchrone
			game = await sync_to_async(Game.objects.get)(id=self.match_id)
			# Récupérer les joueurs de manière asynchrone
			player1 = await sync_to_async(lambda: game.player1)()
			player2 = await sync_to_async(lambda: game.player2)()

			if user not in [player1, player2]:
				await self.close()
				return
		except ObjectDoesNotExist:
			await self.close()
			return

		await self.channel_layer.group_add(
			self.room_group_name,
			self.channel_name
		)
		await self.accept()

	# consumers.py
	async def receive(self, text_data):
		data = json.loads(text_data)
		print(f"Received data:\n {data}")
		if data.get('type') == 'toggle_ready':
			user = self.scope['user']
			try:
				tournament_game = await sync_to_async(
					TournamentGame.objects.select_related('game__player1', 'game__player2').get
				)(
					tournament_id=self.tournament_id,
					game_id=self.match_id
				)
				game = tournament_game.game
				player1 = game.player1
				player2 = game.player2

				print(f"User: {user.id} -> Player1: {player1.id} - Player2: {player2.id}")

				# Debug : Afficher l'état initial AVANT modification
				print(f"[INITIAL] Player1 Ready: {tournament_game.player1_ready}")
				print(f"[INITIAL] Player2 Ready: {tournament_game.player2_ready}")

				if user.id == player1.id:
					tournament_game.player1_ready = not tournament_game.player1_ready
					current_ready = tournament_game.player1_ready
				elif user.id == player2.id:
					tournament_game.player2_ready = not tournament_game.player2_ready
					current_ready = tournament_game.player2_ready
				else:
					return

				await sync_to_async(tournament_game.save)()

				await self.channel_layer.group_send(
					self.room_group_name,
					{
						'type': 'ready_update',
						'player_id': user.id,
						'ready': current_ready
					}
				)

				if tournament_game.player1_ready and tournament_game.player2_ready:
					game.is_active = True
					await sync_to_async(game.save)()
					await self.channel_layer.group_send(
						self.room_group_name,
						{
							'type': 'match_start',
							'match_id': self.match_id
						}
					)

				print(f"[DEBUG] Player 1 ready: {tournament_game.player1_ready}")
				print(f"[DEBUG] Player 2 ready: {tournament_game.player2_ready}")

			except ObjectDoesNotExist:
				pass
	
	async def ready_update(self, event):
		await self.send(text_data=json.dumps({
			"type": "ready_update",
			"player_id": event["player_id"],
			"ready": event["ready"]
		}))
		
	async def match_start(self, event):
		try:
			tournament_game = await sync_to_async(
				TournamentGame.objects.get
			)(
				tournament_id=self.tournament_id,
				game_id=self.match_id
			)
			tournament_game.player1_ready = False
			tournament_game.player2_ready = False
			await sync_to_async(tournament_game.save)()
		except ObjectDoesNotExist:
			pass

		await self.send(text_data=json.dumps({
			"type": "match_start",
			"match_id": event["match_id"]
		}))

class TicTacToeConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		self.game_id = self.scope['url_route']['kwargs']['game_id']
		self.game_group_name = f'game_{self.game_id}'

		self.game = await sync_to_async(Game.objects.select_related('player1', 'player2', 'current_turn').get)(id=self.game_id)

		if self.scope['user'] not in [self.game.player1, self.game.player2]:
			await self.close()
			return

		if not self.game.current_turn:
			await self.set_first_turn()

		await self.channel_layer.group_add(self.game_group_name, self.channel_name)
		try:
			await self.accept()
		except RuntimeError:
			pass

		await self.send_game_state()

	@sync_to_async
	def set_first_turn(self):
		self.game.current_turn = self.game.player1
		self.game.save()

	async def receive(self, text_data):
		self.game = await sync_to_async(Game.objects.select_related('player1', 'player2', 'current_turn').get)(id=self.game_id)

		data = json.loads(text_data)
		index = int(data.get("index"))
		user = self.scope["user"]

		if not await self.is_valid_turn(user):
			return

		board = list(self.game.board)
		if board[index] != " ":
			return

		symbol = await sync_to_async(lambda: 'X' if self.scope['user'] == self.game.player1 else 'O')()
		board[index] = symbol
		self.game.board = "".join(board)
		winner = await sync_to_async(self.check_winner)(board)

		if winner:
			self.game.winner = winner

		await self.update_turn(user)
		await sync_to_async(self.game.save)()

		await self.channel_layer.group_send(
				self.game_group_name,
				{
					"type": "game_update",
					"board": self.game.board,
					"current_turn": self.game.current_turn.username,
					"winner": winner.username if winner else None
					}
				)

	@sync_to_async
	def is_valid_turn(self, user):
		return user == self.game.current_turn

	@sync_to_async
	def update_turn(self, user):
		self.game.current_turn = self.game.player2 if user == self.game.player1 else self.game.player1

	async def send_game_state(self):
		await self.send(text_data=json.dumps({
			"type": "game_update",
			"board": self.game.board,
			"current_turn": self.game.current_turn.username
			}))

	def check_winner(self, board):
		winning_combinations = [
				(0, 1, 2), (3, 4, 5), (6, 7, 8),
				(0, 3, 6), (1, 4, 7), (2, 5, 8),
				(0, 4, 8), (2, 4, 6)
				]
		for a, b, c in winning_combinations:
			if board[a] != " " and board[a] == board[b] == board[c]:
				return self.game.player1 if board[a] == "X" else self.game.player2
		return None

	async def game_update(self, event):
		await self.send(text_data=json.dumps(event))

class ChatConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		self.channel_id = self.scope['url_route']['kwargs']['channel_id']
		self.channel_group_name = f'channel_{self.channel_id}'

		channel = await sync_to_async(Channel.objects.get)(id=self.channel_id)
		participants = await sync_to_async(list)(channel.participants.all())
		print(participants)
		if self.scope['user'] not in participants:
			await self.close()

		await self.channel_layer.group_add(
				self.channel_group_name,
				self.channel_name
				)
		try:
			await self.accept()
		except RuntimeError:
			pass

	async def disconnect(self, close_code):
		await self.channel_layer.group_discard(
				self.channel_group_name,
				self.channel_name
				)

	async def receive(self, text_data):
		text_data_json = json.loads(text_data)
		message_content = text_data_json['message']
		user = self.scope['user']

		await sync_to_async(Messages.objects.create)(channel_id=self.channel_id, user=user, content=message_content)

		await self.channel_layer.group_send(
				self.channel_group_name,
				{
					'type': 'chat_message',
					'message': message_content,
					'user': user.username
					}
				)

	async def chat_message(self, event):
		message = event['message']
		user = event['user']

		await self.send(text_data=json.dumps({
			'message': message,
			'user': user
			}))


class MatchmakingConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		self.user = self.scope["user"]

		if self.user.is_authenticated:
			query_string = self.scope["query_string"].decode()
			mode = "unranked"
			if "mode=" in query_string:
				mode = query_string.split("mode=")[-1]

			active_users[self.user.username] = {
					"channel_name": self.channel_name,
					"mode": mode
					}

			await self.channel_layer.group_add("matchmaking_queue", self.channel_name)
			try:
				await self.accept()
			except RuntimeError:
				pass
			print(f"{self.user.username} rejoint le matchmaking en mode {mode}.")

			# Rechercher un adversaire avec le même mode
			await self.search_match(mode)
		else:
			await self.close()

	async def disconnect(self, close_code):
		await self.channel_layer.group_discard("matchmaking_queue", self.channel_name)
		active_users.pop(self.user.username, None)
		print(f"{self.user.username} quitte le matchmaking.")

	async def search_match(self):
		for username, channel in active_users.items():
			if username != self.user.username:
				await self.find_opponent({ "user": username })
				return
		print("Aucun adversaire trouvé, en attente...")

	async def search_match(self, mode):
		for username, data in active_users.items():
			if username != self.user.username and data["mode"] == mode:
				await self.find_opponent({ "user": username })
				return

		print(f"Aucun adversaire trouvé en mode {mode}, en attente...")

	async def find_opponent(self, event):
		player1 = self.user
		player2_name = event["user"]
		player2_channel = active_users.get(player2_name)

		if not player2_channel:
			print(f"❌ ERREUR: {player2_name} n'a pas de channel actif. Active users: {active_users}")
			return

		player2_data = active_users.get(player2_name)

		if not player2_data:
			print(f"❌ ERREUR: {player2_name} n'a pas de channel actif.")
			return

		player2_channel = player2_data["channel_name"]
		mode = player2_data["mode"]  # Récupère le mode de jeu

		if player1.username == player2_name:
			print("❌ ERREUR: Vous ne pouvez pas jouer contre vous-même.")
			return

		try:
			player2 = await sync_to_async(User.objects.get)(username=player2_name)
		except User.DoesNotExist:
			print(f"❌ ERREUR: {player2_name} n'existe pas.")
			return

		# game = await sync_to_async(Game.objects.create)(player1=player1, player2=player2)
		# print(f"🎮 Match trouvé : {player1.username} vs {player2.username} (Game ID: {game.id})")
		game = await sync_to_async(Game.objects.create)(
				player1=player1,
				player2=player2,
				mode=mode  # On stocke le mode de jeu dans le modèle Game
				)
		print(f"🎮 Match trouvé ({mode}) : {player1.username} vs {player2.username} (Game ID: {game.id})")

		await self.channel_layer.group_discard("matchmaking_queue", self.channel_name)
		await self.channel_layer.group_discard("matchmaking_queue", player2_channel)

		active_users.pop(self.user.username, None)
		active_users.pop(player2_name, None)

		await self.channel_layer.send(self.channel_name, {
			"type": "match_found",
			"game_id": game.id,
			"player1": player1.username,
			"player2": player2.username,
			"mode": mode
			})

		await self.channel_layer.send(player2_channel, {
			"type": "match_found",
			"game_id": game.id,
			"player1": player1.username,
			"player2": player2.username,
			"mode": mode
			})

	async def match_found(self, event):
		await self.send(text_data=json.dumps(event))


class ChatboxConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		self.user = self.scope["user"]

		if not self.user.is_authenticated:
			return

		self.group_name = f"user_{self.user.username}"
		await self.channel_layer.group_add(
				self.group_name,
				self.channel_name
				)

		await self.accept()

	async def disconnect(self, close_code):
		if hasattr(self, 'group_name'):
			await self.channel_layer.group_discard(
					self.group_name,
					self.channel_name
					)

	async def receive(self, text_data):
		data = json.loads(text_data)
		if data['type'] == 'challenge':
			sender = await database_sync_to_async(User.objects.get)(username=data['sender'])
			sender_group = f"user_{data['sender']}"
			receiver = await database_sync_to_async(User.objects.get)(username=data['receiver'])
			receiver_group = f"user_{data['receiver']}"


			await self.channel_layer.group_send(
					receiver_group,
					{
						'type': 'chat_message',
						'message_type': 'challenge',
						'sender': data['sender'],
						'sender_id': sender.id,
						'receiver': data['receiver'],
						'receiver_id': receiver.id,
						'content': data['content']
						}
					)

		elif data['type'] == 'challenge_accepted':
			sender = await database_sync_to_async(User.objects.get)(username=data['sender'])
			receiver = await database_sync_to_async(User.objects.get)(username=data['receiver'])

			# Créer la game UNIQUEMENT maintenant
			game = await database_sync_to_async(Game.objects.create)(
					player1=sender,
					player2=receiver,
					mode='unranked'
					)

			game_url = f"/UnrankedMode/{game.id}/"

			# Envoyer la confirmation aux deux joueurs
			sender_group = f"user_{data['sender']}"
			receiver_group = f"user_{data['receiver']}"

			await self.channel_layer.group_send(
					sender_group,
					{
						'type': 'chat_message',
						'message_type': 'game_created',
						'game_url': game_url
						}
					)

			await self.channel_layer.group_send(
					receiver_group,
					{
						'type': 'chat_message',
						'message_type': 'game_created',
						'game_url': game_url
						}
					)


		elif data['type'] == 'message':
			sender = await database_sync_to_async(User.objects.get)(username=data['sender'])
			receiver = await database_sync_to_async(User.objects.get)(username=data['receiver'])

			# Save message to database
			await database_sync_to_async(Messages.objects.create)(
					sender=sender,
					receiver=receiver,
					content=data['content']
					)

			# Send to receiver's group
			receiver_group = f"user_{data['receiver']}"
			await self.channel_layer.group_send(
					receiver_group,
					{
						'type': 'chat_message',
						'message_type': 'message',
						'sender': data['sender'],
						'receiver': data['receiver'],
						'content': data['content']
						}
					)

			# Also send back to sender's group
			sender_group = f"user_{data['sender']}"
			await self.channel_layer.group_send(
					sender_group,
					{
						'type': 'chat_message',
						'message_type': 'message',
						'sender': data['sender'],
						'receiver': data['receiver'],
						'content': data['content']
						}
					)
		elif data['type'] == 'add_friend':
			try:
				user = self.scope["user"]
				friend = await database_sync_to_async(User.objects.get)(username=data['friend_name'])

				await database_sync_to_async(user.friends.add)(friend)
				await self.send(text_data=json.dumps({
					'type': 'friend_added',
					'success': True,
					'friend_name': friend.username
					}))
			except Exception as e:
				await self.send(text_data=json.dumps({
					'type': 'friend_added',
					'success': False,
					'error': str(e)
					}))
		elif data['type'] == 'unfriend':
			try:
				user = self.scope["user"]
				contact = await database_sync_to_async(User.objects.get)(username=data['contact_name'])

				# Remove contact from user's friends
				await database_sync_to_async(user.friends.remove)(contact)

				await self.send(text_data=json.dumps({
					'type': 'unfriended',
					'success': True
					}))
			except User.DoesNotExist:
				await self.send(text_data=json.dumps({
					'type': 'unfriended',
					'success': False,
					'error': 'User not found'
					}))
			except Exception as e:
				await self.send(text_data=json.dumps({
					'type': 'unfriended',
					'success': False,
					'error': str(e)
					}))

	# async def chat_message(self, event):
	#     await self.send(text_data=json.dumps({
	#         'type': 'message',
	#         'sender': event['sender'],
	#         'receiver': event['receiver'],
	#         'content': event['content']
	#     }))

	async def chat_message(self, event):
		print("\n[DEBUG WEBSOCKET] Message reçu dans chat_message:", event)

		if 'sender' not in event:
			print("❌ ERREUR: 'sender' absent dans event:", event)

		await self.send(text_data=json.dumps({
			'type': event.get('message_type', 'message'),
			'sender': event.get('sender'),
			'sender_id': event.get('sender_id'),
			'receiver': event.get('receiver'),
			'receiver_id': event.get('receiver_id'),
			'game_url': event.get('game_url'),
			'content': event.get('content')
			}))


