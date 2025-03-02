from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from app import views

urlpatterns = [
	path('', views.home, name='home'),
    path('admin/', admin.site.urls),
	path('accounts/', include('allauth.urls')),
	path('profile/', views.profile, name='profile'),
	path('profile/<int:user_id>/', views.profile, name='profile_other'),
	path('update_avatar/', views.update_avatar, name='update_avatar'),
	path('game_modes/', views.game_modes, name='game_modes'),
	path('leaderboard/', views.leaderboard, name='leaderboard'),
	path('rules/', views.rules, name='rules'),
	path('create_channel/<int:user_id>/', views.create_or_get_channel, name='create_or_get_channel'),
	path('channel/<int:channel_id>/', views.channel_page, name='channel_page'),
	path('send_message/<int:channel_id>/', views.send_message, name='send_message'),
	path('matchmaking/', views.matchmaking, name='matchmaking'),
	path('create-game/', views.create_game, name='create_game'),
	path('game/<int:game_id>/', views.game, name='game'),
	path('game-ia/', views.game_ia, name='game-ia'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)