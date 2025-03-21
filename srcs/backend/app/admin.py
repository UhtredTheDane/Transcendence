from django.contrib import admin
from app import models

# Register your models here.

class UserAdmin(admin.ModelAdmin):
	list_display = ['id', 'username', "first_name", "last_name", 'email', 'is_waiting', 'elo_rating', 'is_active', 'avatar', 'channel_name', 'is_staff', 'is_superuser', 'date_joined']
	list_editable = ['first_name', 'last_name', 'email', 'is_waiting', 'elo_rating', 'is_active', 'channel_name', 'avatar', 'is_staff', 'is_superuser']

class GameAdmin(admin.ModelAdmin):
	list_display = ['id', 'is_active', 'mode', 'player1', 'player2', 'score_player1', 'score_player2', 'created_at']
	list_editable = ['is_active', 'mode', 'player1', 'player2', 'score_player1', 'score_player2']

class TournamentAdmin(admin.ModelAdmin):
	list_display = ['id', 'name', 'creator', 'created_at']
	list_editable = ['name', 'creator']

class TournamentPlayerAdmin(admin.ModelAdmin):
	list_display = ['id', 'tournament', 'user', 'is_ready', 'joined_at', 'position']
	list_editable = ['tournament', 'user', 'is_ready', 'position']

class TournamentGameAdmin(admin.ModelAdmin):
	list_display = ['id', 'tournament', 'game', 'player1_ready', 'player2_ready', 'created_at']
	list_editable = ['tournament', 'game', 'player1_ready', 'player2_ready']

class ChannelAdmin(admin.ModelAdmin):
	list_display = ['id', 'name', 'topic', 'created_at']
	list_editable = ['name', 'topic']

class ChannelUserAdmin(admin.ModelAdmin):
	list_display = ['id', 'channel', 'user', 'joined_at']
	list_editable = ['channel', 'user']

class MessageAdmin(admin.ModelAdmin):
	list_display = ['id', 'channel', 'user', 'content', 'created_at']
	list_editable = ['channel', 'user', 'content']

class MessagesAdmin(admin.ModelAdmin):
	list_display = ['id', 'sender', 'receiver', 'content', 'timestamp']
	list_editable = ['sender', 'receiver', 'content']

admin.site.register(models.User, UserAdmin)
admin.site.register(models.Game, GameAdmin)
admin.site.register(models.Tournament, TournamentAdmin)
admin.site.register(models.TournamentPlayer, TournamentPlayerAdmin)
admin.site.register(models.TournamentGame, TournamentGameAdmin)
admin.site.register(models.Channel, ChannelAdmin)
admin.site.register(models.ChannelUser, ChannelUserAdmin)
admin.site.register(models.Message, MessageAdmin)
admin.site.register(models.Messages, MessagesAdmin)