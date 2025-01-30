from django.contrib import admin
from app import models

# Register your models here.

class UserAdmin(admin.ModelAdmin):
	list_display = ['id', 'username', "first_name", "last_name", 'email', 'is_active', 'channel_name', 'is_staff', 'is_superuser', 'date_joined']

class GameAdmin(admin.ModelAdmin):
	list_display = ['id', 'type', 'player1', 'player2', 'winner', 'loser', 'created_at']

class TournamentAdmin(admin.ModelAdmin):
	list_display = ['id', 'name', 'creator', 'created_at']

class TournamentPlayerAdmin(admin.ModelAdmin):
	list_display = ['id', 'tournament', 'user', 'joined_at', 'position']

class TournamentGameAdmin(admin.ModelAdmin):
	list_display = ['id', 'tournament', 'game']

class ChannelAdmin(admin.ModelAdmin):
	list_display = ['id', 'name', 'is_private', 'topic', 'created_at']

class ChannelUserAdmin(admin.ModelAdmin):
	list_display = ['id', 'channel', 'user', 'joined_at']

class MessageAdmin(admin.ModelAdmin):
	list_display = ['id', 'channel', 'user', 'content', 'created_at']

admin.site.register(models.User, UserAdmin)
admin.site.register(models.Game, GameAdmin)
admin.site.register(models.Tournament, TournamentAdmin)
admin.site.register(models.TournamentPlayer, TournamentPlayerAdmin)
admin.site.register(models.TournamentGame, TournamentGameAdmin)
admin.site.register(models.Channel, ChannelAdmin)
admin.site.register(models.ChannelUser, ChannelUserAdmin)
admin.site.register(models.Message, MessageAdmin)