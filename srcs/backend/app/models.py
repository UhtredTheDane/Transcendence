from django.db import models
from django.contrib.auth.models import AbstractUser
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

class Game(models.Model):
	MODE_CHOICES = [
		('solo', 'Solo (contre IA)'),
		('multiplayer', 'Multijoueur'),
	]

	mode = models.CharField(max_length=50, choices=MODE_CHOICES, default='multiplayer')
	player1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='games_as_player1')
	player2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='games_as_player2', null=True, blank=True)
	ball_x = models.FloatField(default=400)
	ball_y = models.FloatField(default=200)
	player1_y = models.FloatField(default=170)
	player2_y = models.FloatField(default=170)
	max_score = models.IntegerField(default=11, null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(100)])  # Score maximum pour gagner
	timer = models.IntegerField(default=0)
	ball_super_speed = models.BooleanField(default=False)
	score_player1 = models.IntegerField(default=0)
	score_player2 = models.IntegerField(default=0)
	is_active = models.BooleanField(default=True)
	is_paused = models.BooleanField(default=False)
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"Game {self.id} - {self.player1.username} vs {self.player2.username if self.player2 else 'IA'}"


class Tournament(models.Model):
	creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tournament_creator")
	name = models.CharField(max_length=100)
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"Tournament {self.id} - {self.name}"


# Tournament
class TournamentPlayer(models.Model):
	tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name="players")
	user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tournaments_user")
	joined_at = models.DateTimeField(auto_now_add=True)
	position = models.IntegerField(blank=True, null=True)

	def __str__(self):
		return f"Player {self.user.username} ({self.user.id}) in Tournament {self.tournament.name} ({self.tournament.id})"


class TournamentGame(models.Model):
	tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name="tournament_games")
	game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name="tournament_game")

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
	channel = models.ForeignKey(Channel, on_delete=models.CASCADE, related_name="messages")
	user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="messages")
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