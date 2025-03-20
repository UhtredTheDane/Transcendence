from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
	re_path(r'wss/RankedMode/(?P<game_id>\d+)/$', consumers.GameConsumer.as_asgi()),
 	re_path(r'wss/UnrankedMode/(?P<game_id>\d+)/$', consumers.GameConsumer.as_asgi()),
	re_path(r'wss/RushMode/(?P<game_id>\d+)/$', consumers.GameConsumer.as_asgi()),
	re_path(r'wss/TimerMode/(?P<game_id>\d+)/$', consumers.GameConsumer.as_asgi()),
	re_path(r'wss/MaxScoreMode/(?P<game_id>\d+)/$', consumers.GameConsumer.as_asgi()),
	re_path(r'wss/ChallengeMode/(?P<game_id>\d+)/$', consumers.GameConsumer.as_asgi()),
	re_path(r'wss/TicTacToeMode/(?P<game_id>\d+)/$', consumers.TicTacToeConsumer.as_asgi()),
    re_path(r'wss/MatchMaking/$', consumers.MatchmakingConsumer.as_asgi()),
	re_path(r'wss/tournament/match/(?P<match_id>\d+)/$', consumers.MatchConsumer.as_asgi()),
	re_path(r'wss/chatbox/$', consumers.ChatboxConsumer.as_asgi()),
]
