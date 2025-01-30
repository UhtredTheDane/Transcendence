from channels.generic.websocket import AsyncWebsocketConsumer
import json
from asgiref.sync import sync_to_async
from .models import Game, User, Channel, ChannelUser, Message
from django.utils import timezone

active_users = {}

class ChatConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		self.channel_id = self.scope['url_route']['kwargs']['channel_id']
		self.channel_group_name = f'channel_{self.channel_id}'

		channel = await sync_to_async(Channel.objects.get)(id=self.channel_id)
		participants = await sync_to_async(list)(channel.participants.all())
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


