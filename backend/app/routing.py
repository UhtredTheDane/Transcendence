from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
	re_path(r'ws/game/(?P<game_id>\d+)/$', consumers.GameConsumer.as_asgi()),
	re_path(r'ws/channel/(?P<channel_id>\d+)/$', consumers.ChatConsumer.as_asgi()),
    re_path(r'ws/matchmaking/$', consumers.MatchmakingConsumer.as_asgi()),
]
