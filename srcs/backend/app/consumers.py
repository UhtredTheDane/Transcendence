from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async
from .models import Game, User, Channel, ChannelUser, Message, Messages
from django.utils import timezone
import json
import asyncio


active_users = {}

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
            await self.update_maxScore(event)
        elif message_type == "update_speed":
            await self.update_speed(event)
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
        print("target player: ", targetPlayer)

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
        self.game.score_player1 = data.get("score_player1", self.game.score_player1)
        self.game.score_player2 = data.get("score_player2", self.game.score_player2)

        await sync_to_async(self.game.save)(update_fields=["score_player1", "score_player2", "is_active"])

        await self.channel_layer.group_send(
                self.game_group_name,
                {
                    "type": "game_over"
                }
                )

        await asyncio.sleep(5)

        await self.channel_layer.group_discard(
                self.game_group_name,
                self.channel_name
                )

        try:
            await self.close()
            print("sa ferme le socket")
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
            await self.accept()
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
            await self.close()
            return
            
        # Add user to their personal group
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
            receiver_group = f"user_{data['receiver']}"
            
            await self.channel_layer.group_send(
                receiver_group,
                {
                    'type': 'chat_message',
                    'message_type': 'challenge',
                    'sender': data['sender'],
                    'receiver': data['receiver'],
                    'content': data['content']
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
        await self.send(text_data=json.dumps({
            'type': event.get('message_type', 'message'),
            'sender': event['sender'],
            'receiver': event['receiver'],
            'content': event['content']
        }))
    
    