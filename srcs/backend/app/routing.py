from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
	re_path(r'ws/RankedMode/(?P<game_id>\d+)/$', consumers.GameConsumer.as_asgi()),
 	re_path(r'ws/UnrankedMode/(?P<game_id>\d+)/$', consumers.GameConsumer.as_asgi()),
	re_path(r'ws/RushMode/(?P<game_id>\d+)/$', consumers.GameConsumer.as_asgi()),
	re_path(r'ws/TimerMode/(?P<game_id>\d+)/$', consumers.GameConsumer.as_asgi()),
	re_path(r'ws/MaxScoreMode/(?P<game_id>\d+)/$', consumers.GameConsumer.as_asgi()),
	re_path(r'ws/ChallengeMode/(?P<game_id>\d+)/$', consumers.GameConsumer.as_asgi()),
	re_path(r'ws/TicTacToeMode/(?P<game_id>\d+)/$', consumers.TicTacToeConsumer.as_asgi()),
    ##re_path(r'ws/matchmaking/$', consumers.MatchmakingConsumer.as_asgi()),
    re_path(r'ws/MatchMaking/$', consumers.MatchmakingConsumer.as_asgi()),
	re_path(r'ws/tournament/match/(?P<match_id>\d+)/$', consumers.MatchConsumer.as_asgi()),
	re_path(r'ws/chatbox/$', consumers.ChatboxConsumer.as_asgi()),
]
