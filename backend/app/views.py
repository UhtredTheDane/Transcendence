import os
import uuid
from django.conf import settings
from django.shortcuts import get_object_or_404, render, redirect
from django.http import HttpResponse, HttpResponseNotFound, HttpResponseRedirect, JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .forms import ProfilePictureForm
from .models import User, Channel, ChannelUser, Message, Game
from app.tests import Test
import json

def home(request):
	is_logged_in = request.user.is_authenticated
	return render(request, 'home.html', { 'is_logged_in': is_logged_in })

# Live Chat

@login_required
def create_or_get_channel(request, user_id):
	if not request.user.is_authenticated:
		return HttpResponseRedirect('/accounts/login')

	other_user = get_object_or_404(User, id=user_id)
	current_user = request.user

	if (other_user == current_user):
		return HttpResponseNotFound("Vous ne pouvez pas discuter avec vous-même")
	
	print(current_user is AnonymousUser)
	if (current_user is AnonymousUser):
		return HttpResponseNotFound("Vous devez être connecté pour accéder à cette page")

	# Chercher si un channel existe déjà entre les deux utilisateurs
	channel = Channel.objects.filter(
		participants=current_user
	).filter(
		participants=other_user
	).distinct()


	if not channel.exists():
		# Créer un nouveau channel
		channel = Channel.objects.create(name=f"Channel-{current_user.id}-{other_user.id}")
		channel.participants.add(current_user, other_user)
		channel.save()
	else:
		channel = channel.first()

	return redirect(f"/channel/{channel.id}/")

@login_required
def channel_page(request, channel_id):
	# Récupérer le salon et ses messages
	channel = Channel.objects.get(id=channel_id)
	messages = channel.messages.all()

	return render(request, 'channel_page.html', {
		'channel': channel,
		'messages': messages
	})

@login_required
def send_message(request, channel_id):
	channel = Channel.objects.get(id=channel_id)
	
	if request.method == 'POST':
		message_content = request.POST['message']
		Message.objects.create(channel=channel, user=request.user, content=message_content)
	
	return HttpResponseRedirect(request.META.get('HTTP_REFERER'))

@login_required
def create_game(request):
	mode = request.GET.get('mode', 'multiplayer')  # Par défaut, mode multijoueur
	player1 = request.user  # Joueur 1 est l'utilisateur connecté

	if mode == 'solo':
		# Mode solo : pas de joueur 2
		game = Game.objects.create(player1=player1, mode='solo')
	else:
		# Mode multijoueur : récupérer le joueur 2 via le matchmaking
		player2_id = request.GET.get('player2_id')
		if not player2_id:
			return JsonResponse({ 'error': 'player2_id is required for multiplayer mode' }, status=400)
		player2 = User.objects.get(id=player2_id)
		game = Game.objects.create(player1=player1, player2=player2, mode='multiplayer')

	return JsonResponse({ 'game_id': game.id })


# Simple pages
@login_required
def update_avatar(request):
    if request.method == 'POST':
        user = request.user

        old_avatar = User.objects.get(id=user.id).avatar
        old_avatar_path = os.path.join(settings.MEDIA_ROOT, str(old_avatar)) if old_avatar else None

        form = ProfilePictureForm(request.POST, request.FILES, instance=user)
        if form.is_valid():
            new_avatar = request.FILES['avatar']

            ext = new_avatar.name.split('.')[-1]
            new_filename = f"{user.id}_{uuid.uuid4().hex}.{ext}"

            if old_avatar and old_avatar.url != '/media/avatars/default.png':
                if os.path.exists(old_avatar_path):
                    os.remove(old_avatar_path)

            user.avatar.save(new_filename, new_avatar)

            return JsonResponse({'status': 'success', 'image_url': user.avatar.url})
        return JsonResponse({'status': 'error', 'errors': form.errors})
    return JsonResponse({'status': 'error', 'message': 'Invalid request'})


@login_required
def profile(request):
	user_data = User.objects.get(id=request.user.id)
	print(user_data.avatar)
	return render(request, 'profile.html', { 'user': user_data })

def game_modes(request):
	return render(request, 'game_modes.html')

def leaderboard(request):
	return render(request, 'leaderboard.html')

def rules(request):
	return render(request, 'rules.html')

def game(request):
	return render(request, 'game.html')

def game_ia(request):
	mode = request.GET.get('mode', 'medium')
	return render(request, 'game-ia.html', { 'mode': mode })

@login_required
def matchmaking(request):
	return render(request, 'matchmaking.html')
