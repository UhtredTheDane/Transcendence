from django.contrib.auth.models import AbstractUser
from rest_framework import serializers
from app.models import User, Game, Tournament, TournamentPlayer, TournamentGame, Channel, ChannelUser, Message

class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = ['id', 'username', 'password', 'email', 'date_joined']
		extra_kwargs = {'password': {'write_only': True}}

	def create(self, validated_data):
		return User.objects.create(**validated_data)

	def set_user(self, field_name, value):
		if hasattr(self, field_name):
			setattr(self, field_name, value)
		else:
			raise AttributeError(f"'{self.__class__.__name__}' object has no attribute '{field_name}'")

class GameSerializer(serializers.ModelSerializer):
	class Meta:
		model = Game
		fields = ['id', 'type', 'player1', 'player2', 'winner', 'loser', 'created_at']

	def create(self, validated_data):
		return Game.objects.create(**validated_data)

	def set_game(self, field_name, value):
		if hasattr(self, field_name):
			setattr(self, field_name, value)
		else:
			raise AttributeError(f"'{self.__class__.__name__}' object has no attribute '{field_name}'")

class TournamentSerializer(serializers.ModelSerializer):
	class Meta:
		model = Tournament
		fields = ['id', 'name', 'creator', 'created_at']

	def create(self, validated_data):
		return Tournament.objects.create(**validated_data)

	def set_tournament(self, field_name, value):
		if hasattr(self, field_name):
			setattr(self, field_name, value)
		else:
			raise AttributeError(f"'{self.__class__.__name__}' object has no attribute '{field_name}'")

class TournamentPlayerSerializer(serializers.ModelSerializer):
	class Meta:
		model = TournamentPlayer
		fields = ['id', 'tournament', 'user', 'joined_at', 'position']

	def create(self, validated_data):
		return TournamentPlayer.objects.create(**validated_data)

	def set_tournament_player(self, field_name, value):
		if hasattr(self, field_name):
			setattr(self, field_name, value)
		else:
			raise AttributeError(f"'{self.__class__.__name__}' object has no attribute '{field_name}'")

class TournamentGameSerializer(serializers.ModelSerializer):
	class Meta:
		model = TournamentGame
		fields = ['id', 'tournament', 'game']

	def create(self, validated_data):
		return TournamentGame.objects.create(**validated_data)

	def set_tournament_game(self, field_name, value):
		if hasattr(self, field_name):
			setattr(self, field_name, value)
		else:
			raise AttributeError(f"'{self.__class__.__name__}' object has no attribute '{field_name}'")

class ChannelSerializer(serializers.ModelSerializer):
	class Meta:
		model = Channel
		fields = ['id', 'name', 'topic', 'created_at']

	def create(self, validated_data):
		return Channel.objects.create(**validated_data)

	def set_channel(self, field_name, value):
		if hasattr(self, field_name):
			setattr(self, field_name, value)
		else:
			raise AttributeError(f"'{self.__class__.__name__}' object has no attribute '{field_name}'")

class ChannelUserSerializer(serializers.ModelSerializer):
	class Meta:
		model = ChannelUser
		fields = ['id', 'channel', 'user', 'joined_at']

	def create(self, validated_data):
		return ChannelUser.objects.create(**validated_data)

	def set_channel_user(self, field_name, value):
		if hasattr(self, field_name):
			setattr(self, field_name, value)
		else:
			raise AttributeError(f"'{self.__class__}' object has no attribute '{field_name}'")

class MessageSerializer(serializers.ModelSerializer):
	class Meta:
		model = Message
		fields = ['id', 'channel', 'user', 'content', 'created_at']

	def create(self, validated_data):
		return Message.objects.create(**validated_data)

	def set_message(self, field_name, value):
		if hasattr(self, field_name):
			setattr(self, field_name, value)
		else:
			raise AttributeError(f"'{self.__class__}' object has no attribute '{field_name}'")


