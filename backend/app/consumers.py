from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from .models import Game, User, Channel, ChannelUser, Message
from django.utils import timezone
import json
import asyncio

active_users = {}

class GameConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		self.game_id = self.scope['url_route']['kwargs']['game_id']
		self.game_group_name = f'game_{self.game_id}'
		
		try:
			self.game = await sync_to_async(Game.objects.get)(id=self.game_id)
			self.player1 = await sync_to_async(lambda: self.game.player1)()
			self.player2 = await sync_to_async(lambda: self.game.player2)()
		except Game.DoesNotExist:
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
			}))
	
	async def disconnect(self, close_code):
		await self.channel_layer.group_discard(
			self.game_group_name,
			self.channel_name
		)
	
	async def receive(self, text_data):
		data = json.loads(text_data)
		message_type = data.get("type")

		if message_type == "move":
			await self.handle_move(data)
		elif message_type == "ball":
			await self.handle_ball_position(data)
		elif message_type == "score":
			await self.handle_score_update(data)
		elif message_type == "pause":
			await self.handle_pause(data)
		elif message_type == "end":
			await self.end_game(data)
	
	async def handle_move(self, data):
		player = self.scope['user']
		new_position = data.get("position")
		
		if player == self.player1:
			self.game.player1_y = new_position
		elif player == self.player2:
			self.game.player2_y = new_position
		
		await sync_to_async(self.game.save)()
		
		# print(f"[LOG] Move received: {player} moved to {new_position}")
		# print(f"[LOG] Sending update: {'player1' if player == self.player1 else 'player2'} moves to {new_position}")

		await self.channel_layer.group_send(
			self.game_group_name,
			{
				"type": "update_position",
				"player": "player1" if player == self.player1 else "player2",
				"position": new_position,
			}
		)
	
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
		self.game.score_player1 = data.get("player1_score", self.game.score_player1)
		self.game.score_player2 = data.get("player2_score", self.game.score_player2)

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
		self.game.score_player1 = data.get("score_player1", self.game.score_player1)
		self.game.score_player2 = data.get("score_player2", self.game.score_player2)

		await sync_to_async(self.game.save)(update_fields=["score_player1", "score_player2", "is_active"])
	
		await self.channel_layer.group_send(
			self.game_group_name,
			{
				"type": "game_over"
			}
		)

		await asyncio.sleep(2)

		await self.channel_layer.group_discard(
			self.game_group_name,
			self.channel_name
		)
		
		try:
			await self.close()
		except Exception as e:
			print(f"Error closing connection: {e}")
			pass
	
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
		await self.accept()

	async def disconnect(self, close_code):
		await self.channel_layer.group_discard(
			self.channel_group_name,
			self.channel_name
		)

	async def receive(self, text_data):
		text_data_json = json.loads(text_data)
		message_content = text_data_json['message']
		user = self.scope['user']

		await sync_to_async(Message.objects.create)(channel_id=self.channel_id, user=user, content=message_content)

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
			active_users[self.user.username] = self.channel_name
			await self.channel_layer.group_add("matchmaking_queue", self.channel_name)
			await self.accept()
			print(f"{self.user.username} rejoint le matchmaking.")
			await self.search_match()
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

	async def find_opponent(self, event):
		player1 = self.user
		player2_name = event["user"]
		player2_channel = active_users.get(player2_name)

		if not player2_channel:
			print(f"❌ ERREUR: {player2_name} n'a pas de channel actif. Active users: {active_users}")
			return

		if player1.username == player2_name:
			print("❌ ERREUR: Vous ne pouvez pas jouer contre vous-même.")
			return

		try:
			player2 = await sync_to_async(User.objects.get)(username=player2_name)
		except User.DoesNotExist:
			print(f"❌ ERREUR: {player2_name} n'existe pas.")
			return

		game = await sync_to_async(Game.objects.create)(player1=player1, player2=player2)
		print(f"🎮 Match trouvé : {player1.username} vs {player2.username} (Game ID: {game.id})")

		await self.channel_layer.group_discard("matchmaking_queue", self.channel_name)
		await self.channel_layer.group_discard("matchmaking_queue", player2_channel)

		active_users.pop(self.user.username, None)
		active_users.pop(player2_name, None)

		await self.channel_layer.send(self.channel_name, {
			"type": "match_found",
			"game_id": game.id,
			"player1": player1.username,
			"player2": player2.username,
		})

		await self.channel_layer.send(player2_channel, {
			"type": "match_found",
			"game_id": game.id,
			"player1": player1.username,
			"player2": player2.username,
		})

	async def match_found(self, event):
		await self.send(text_data=json.dumps(event))


