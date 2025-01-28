from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import FileExtensionValidator, MaxValueValidator, MinValueValidator
from django.utils.translation import gettext_lazy as _

# Create your models here.
# class Message(models.Model):
#     content = models.CharField(max_length=280)
#     created_at = models.DateTimeField(auto_now_add=True)
#     user = models.ForeignKey(User, on_delete=models.CASCADE)

class User(AbstractUser):
	STATUS_CHOICES = [
		('on', 'online'),
		('off', 'offline'),
		('dnd', 'do not disturb'),
	]

	bio = models.CharField(max_length=280, blank=True, null=True)
	avatar = models.ImageField(upload_to='avatars/', default='avatars/default.png', validators=[FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png'])])
	friends = models.ManyToManyField('self', symmetrical=True, blank=True)
	status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='off')
	visual_impairment_level = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(5)]) # Visually Impaired User (daltonisme)

	def get_user(self):
		return self

	def get_user_username(self):
		return self.username

	def get_user_full_name(self):
		return f"{self.first_name} {self.last_name}"

	def get_user_avatar(self):
		return self.avatar.url

	def __str__(self):
		return f"{self.username} ({self.id})"

class Friend(models.Model):
	user_id = models.ForeignKey(User, on_delete=models.CASCADE)

class Game(models.Model):
	TYPE_CHOICES = [
		(1, 'Two Players'),
		(2, 'AI'),
		(3, 'Tournament'),
	]

	type = models.IntegerField(choices=TYPE_CHOICES, default=1)
	player1 = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='games_as_player1')
	player2 = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='games_as_player2')
	winner = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='games_won')
	loser = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='games_lost')
	created_at = models.DateTimeField(auto_now_add=True)

	def get_game(self):
		return self

	def get_winner(self):
		return self.winner

	def get_loser(self):
		return self.loser

	def get_type(self):
		return self.type

	def get_type_display(self):
		return dict(self.TYPE_CHOICES)[self.type]

	def __str__(self):
		return f"Game {self.id} - {self.get_type_display()}"


class Tournament(models.Model):
	creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tournament_creator")
	name = models.CharField(max_length=100)
	created_at = models.DateTimeField(auto_now_add=True)

	def get_tournament(self):
		return self

	def get_creator(self):
		return self.creator

	def get_creator_display(self):
		return self.creator.username

	def get_name(self):
		return self.name

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
	name = models.CharField(max_length=100, unique=True)
	topic = models.CharField(max_length=280, blank=True, null=True)
	created_at = models.DateTimeField(auto_now_add=True)

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
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"Message {self.id} by {self.user.username} in {self.channel.name}"
