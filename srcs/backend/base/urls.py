from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from app import views

urlpatterns = [
	path('', views.home, name='home'),
	path('navbar/', views.navbar, name="navbar"),
    path('admin/', admin.site.urls),
	path('accounts/', include('allauth.urls')),
    path("auth/42/login/", views.auth_42_login, name="auth_42_login"),
    path("auth/42/callback/", views.auth_42_callback, name="auth_42_callback"),
	path('SignIn/', views.signin, name='signin'),
	path('ProfilePage/', views.profile, name='profile'),
	path('profile/<int:user_id>/', views.profile, name='profile_other'),
	path('update_avatar/', views.update_avatar, name='update_avatar'),
	path('SignUp/', views.signup, name='signup'),
	path('PasswordReset/', views.passwordreset, name='passwordreset'),

	path('GameModes/', views.game_modes, name='game_modes'),
	path('AIMode/', views.aimode, name='aimode'),
	path('Error404/', views.error404, name='error404'),
	path('InviteTournament/', views.invitetournament, name='invitetournament'),
	path('JoinTournament/', views.jointournament, name='jointournament'),	
	path('TournamentPage/', views.tounrnamentpage, name='tournamentpage'),
	path('PongTourny/', views.pongtourny, name='pongtourny'),	
	path('MaxScoreMode/', views.maxscoremode, name='maxscoremode'),	
	path('UnrankedMode/', views.unrankedmode, name='unrankedmode'),	
	path('RankedMode/', views.rankedmode, name='rankedmode'),	
	path('RushMode/', views.rushmode, name='rushmode'),	
	path('TimerMode/', views.timermode, name='timermode'),
	path('TicTacToe/', views.tictactoe, name='tictactoe'),
	path('MyFriends/', views.myfriends, name='myfriends'),
	path('NewProfilePage/', views.newprofile, name='newprofilepage'),

	path('leaderboard/', views.leaderboard, name='leaderboard'),
	path('PongRules/', views.rules, name='rules'),
	path('create_channel/<int:user_id>/', views.create_or_get_channel, name='create_or_get_channel'),
	path('channel/<int:channel_id>/', views.channel_page, name='channel_page'),
	path('send_message/<int:channel_id>/', views.send_message, name='send_message'),
	##path('matchmaking/', views.matchmaking2, name='matchmaking2'),
	path('create-game/', views.create_game, name='create_game'),
	path('RankedMode/<int:game_id>/', views.game, name='game'),
	path('game-ia/', views.game_ia, name='game-ia'),
 	path('MatchMaking/', views.matchmaking, name='matchmaking'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
