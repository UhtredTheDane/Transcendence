from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from app import views
from django.views.generic import RedirectView
from django.contrib.staticfiles.storage import staticfiles_storage
from django.views.decorators.csrf import csrf_exempt


urlpatterns = [
	path('', views.home, name='home'),
	path('navbar/', views.navbar, name="navbar"),
    path('admin/', admin.site.urls),
	path('accounts/', include('allauth.urls')),
    path("auth/42/login/", views.auth_42_login, name="auth_42_login"),
    path("auth/42/callback/", views.auth_42_callback, name="auth_42_callback"),
	path('SignIn/', views.signin, name='signin'),
	path('profile/<int:user_id>/', views.profile, name='profile_other'),
	path('update_avatar/', views.update_avatar, name='update_avatar'),
	path('SignUp/', views.signup, name='signup'),
	path('PasswordReset/', views.passwordreset, name='passwordreset'),

	path('GameModes/', views.game_modes, name='game_modes'),
	path('AIMode/', views.aimode, name='aimode'),
	path('Error404/', views.error404, name='error404'),
	path('InviteTournament/', views.invitetournament, name='invitetournament'),
	path('JoinTournament/', views.jointournament, name='jointournament'),
	path('TournamentPage/<int:tournament_id>/', views.tournamentpage, name='TournamentPage'),
	path('TournamentPage/<int:tournament_id>/ready/', views.set_ready_status, name='set_ready_status'),
	path('create_tournament/', views.create_tournament, name='create_tournament'),
	path('MyFriends/', views.myfriends, name='myfriends'),

	path('leaderboard/', views.leaderboard, name='leaderboard'),
	path('PongRules/', views.rules, name='rules'),
	path('create_channel/<int:user_id>/', views.create_or_get_channel, name='create_or_get_channel'),
	path('channel/<int:channel_id>/', views.channel_page, name='channel_page'),
	path('send_message/<int:channel_id>/', views.send_message, name='send_message'),
	path('create-game/', views.create_game, name='create_game'),
 
 
 
 
	path('save_profile/', views.save_profile, name='save_profile'),
 
 
 
 
	path('RankedMode/<int:game_id>/', views.RankedMode, name='RankedMode'),
 	path('UnrankedMode/<int:game_id>/', views.UnrankedMode, name='UnrankedMode'),
  	path('RushMode/<int:game_id>/', views.RushMode, name='RushMode'),
	path('MaxScoreMode/<int:game_id>/', views.MaxScoreMode, name='MaxScoreMode'),
	path('TournamentMode/<int:game_id>/', views.TournamentMode, name='TournamentMode'),
	path('TicTacToeMode/<int:game_id>/', views.TicTacToeMode, name='TicTacToeMode'),

    path('checkMatches/<int:tournament_id>', views.check_matches, name='check_matches'),
    path('add-match/', views.add_match, name='add_match'),
    path('getPlayerMatches/<int:tournament_id>/<str:player_name>/', views.get_player_matches, name='get_player_matches'),

	path('ChallengeMode/<int:game_id>/', views.ChallengeMode, name='ChallengeMode'),

 	path('MatchMaking/', views.matchmaking, name='matchmaking'),
    path('get_messages/<str:contact_username>/', views.get_messages, name='get_messages'),
    
	path('ProfilePage/<str:username>/', views.profile, name='user_profile'),
	path('ProfilePage/', views.profile, name='profile'),
	path('favicon.ico', RedirectView.as_view(
		url='/static/icons/42_logo.ico', 
		permanent=True
	), name='favicon'),
    #  path('ProfilePage/save/', csrf_exempt(views.save_profile), name='save_profile'),

]

if settings.DEBUG:
    # urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    # Add static files handling
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    # Add media files handling
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
