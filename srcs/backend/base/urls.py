"""
URL configuration for transcendance project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from app import views

urlpatterns = [
	path('', views.index, name='index'),
    path('admin/', admin.site.urls),
	path('create_channel/<int:user_id>/', views.create_or_get_channel, name='create_or_get_channel'),
	path('channel/<int:channel_id>/', views.channel_page, name='channel_page'),
	path('send_message/<int:channel_id>/', views.send_message, name='send_message'),
	path('matchmaking/', views.matchmaking, name='matchmaking'),
	path('create-game/', views.create_game, name='create_game'),
	path('game/', views.game, name='game'),
	path('game-ia/', views.game_ia, name='game-ia'),
	path('accounts/', include('allauth.urls')),
]
