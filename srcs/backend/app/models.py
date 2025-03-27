from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.postgres.fields import JSONField
from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator, MaxValueValidator, MinValueValidator
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
	STATUS_CHOICES = [
		('on', 'online'),
		('off', 'offline'),
		('dnd', 'do not disturb'),
	]

	bio = models.CharField(max_length=280, blank=True, null=True)
	avatar = models.ImageField(upload_to='avatars/', null=True, blank=True, default='default/avatar.png')
	friends = models.ManyToManyField('self', symmetrical=True, blank=True)
	blocked = models.ManyToManyField('self', symmetrical=False, related_name="blocked_by", blank=True)
	status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='off')
	visual_impairment_level = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(5)]) # Visually Impaired User (daltonisme)
	is_waiting = models.BooleanField(default=False)
	elo_rating = models.IntegerField(default=1000)
	channel_name = models.CharField(max_length=255, blank=True, null=True)

	def __str__(self):
		return f"{self.username} ({self.id})"

	def update_profile(self, username, email, password=None):
			"""Update user profile with validation"""
			if User.objects.exclude(id=self.id).filter(username=username).exists():
				raise ValueError("Username already taken")
			if User.objects.exclude(id=self.id).filter(email=email).exists():
				raise ValueError("Email already taken")
			self.username = username
			self.email = email
			if password:
				self.set_password(password)
				
			self.save()
			return self

class Game(models.Model):
	MODE_CHOICES = [
		('ranked', 'Ranked'),
		('unranked', 'Unranked'),
		('tournament', 'Tournament'),
		('tictactoe', 'TicTacToe'),
		('solo', 'Solo'),
		('rushmode', 'RushMode'),
		('timermode', 'TimerMode'),
		('maxscoremode', 'MaxScoreMode')
	]
	mode = models.CharField(max_length=20, choices=MODE_CHOICES, default='unranked')
	player1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='player1', null=True, blank=True, db_index=True)
	player2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='player2', null=True, blank=True, db_index=True)
	ball_x = models.FloatField(default=400)
	ball_y = models.FloatField(default=400)
	player1_y = models.FloatField(default=170)
	player2_y = models.FloatField(default=170)
	maxScore = models.IntegerField(default=11, null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(100)])  # Score maximum pour gagner
	timer = models.IntegerField(default=0)
	speed = models.IntegerField(default=0)
	score_player1 = models.IntegerField(default=0)
	score_player2 = models.IntegerField(default=0)
	is_active = models.BooleanField(default=True)
	is_ended = models.BooleanField(default=False)
	is_paused = models.BooleanField(default=False)
	created_at = models.DateTimeField(auto_now_add=True)

	# For TicTacToe

	board = models.CharField(max_length=9, default=" " * 9)
	current_turn = models.ForeignKey('User', on_delete=models.CASCADE, related_name="current_games", null=True, blank=True)

	def __str__(self):
		player1_name = self.player1.username if self.player1 else "To Be Determined"
		player2_name = self.player2.username if self.player2 else "To Be Determined or AI"
		return f"Game {self.id} - {player1_name} vs {player2_name}"

	def clean(self):
		if self.player1 == self.player2 and self.player1 is not None and self.player2 is not None:
			raise ValidationError("Un joueur ne peut pas jouer contre lui-même")

class Tournament(models.Model):
	creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tournament_creator")
	name = models.CharField(max_length=100, default=None, blank=True, null=True)
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"Tournament {self.id} - {self.name}"


# TournamentmaxScore
class TournamentPlayer(models.Model):
	tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name="players")
	user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tournaments_user")
	is_ready = models.BooleanField(default=False)
	joined_at = models.DateTimeField(auto_now_add=True)
	position = models.IntegerField(blank=True, null=True)

	def __str__(self):
		return f"Player {self.user.username} ({self.user.id}) in Tournament {self.tournament.name} ({self.tournament.id})"


class TournamentGame(models.Model):
	tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE)
	game = models.ForeignKey(Game, on_delete=models.CASCADE)
	round_number = models.IntegerField(default=1)  # 1: Quartiers, 2: Demis, 3: Finale
	player1_ready = models.BooleanField(default=False)
	player2_ready = models.BooleanField(default=False)
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"Game {self.id} in Tournament {self.tournament.name} ({self.tournament.id})"


# Live Chat
class Channel(models.Model):
	class Meta:
		ordering = ['-created_at']
		
	name = models.CharField(max_length=100, unique=True)
	topic = models.CharField(max_length=280, blank=True, null=True)
	created_at = models.DateTimeField(auto_now_add=True)
	participants = models.ManyToManyField(User, related_name="private_channels", blank=True)  # Pour les salons privés

	def __str__(self):
		return f"Channel {self.name}"


class ChannelUser(models.Model):
	channel = models.ForeignKey(Channel, on_delete=models.CASCADE, related_name="users")
	user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="channels")
	joined_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"{self.user.username} in {self.channel.name}"


class Message(models.Model):
	channel = models.ForeignKey(Channel, on_delete=models.CASCADE, related_name="message")
	user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="message")
	content = models.TextField()
	is_read = models.BooleanField(default=False)
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"Message {self.id} by {self.user.username} in {self.channel.name}"

class Messages(models.Model):
	sender = models.ForeignKey(User, related_name='sent_messages', on_delete=models.CASCADE)
	receiver = models.ForeignKey(User, related_name='received_messages', on_delete=models.CASCADE)
	content = models.TextField()
	timestamp = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ['timestamp']