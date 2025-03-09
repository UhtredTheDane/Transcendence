import os
import uuid
from django.conf import settings
from django.shortcuts import get_object_or_404, render, redirect
from django.http import HttpResponse, HttpResponseNotFound, HttpResponseRedirect, Http404, JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from allauth.socialaccount.models import SocialAccount
from .models import User, Channel, ChannelUser, Message, Game
from .forms import ProfilePictureForm
from app.tests import Test
import json

def home(request):
	is_logged_in = request.user.is_authenticated
	return render(request, 'HomePage.html', { 'is_logged_in': is_logged_in })

def navbar(request):
    user = request.user if request.user.is_authenticated else None
    avatar_url = user.avatar.url if user and user.avatar else '/media/default/avatar.png'

    return render(request, 'navbar.html', { 'avatar': avatar_url })


def leaderboard(request):
	return render(request, 'leaderboard.html')

# Live Chat

@login_required
def create_or_get_channel(request, user_id):
	if not request.user.is_authenticated:
		return HttpResponseRedirect('/SignIn')

	other_user = get_object_or_404(User, id=user_id)
	current_user = request.user

	if (other_user == current_user):
		return HttpResponseNotFound("Vous ne pouvez pas discuter avec vous-même")
	
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


# Games

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
		try:
			player2 = get_object_or_404(User, id=player2_id)
		except:
			raise Http404("Opponent does not exist")
		game = Game.objects.create(player1=player1, player2=player2, mode='multiplayer')

	return JsonResponse({ 'game_id': game.id })

@login_required
def game(request, game_id):
    game = get_object_or_404(Game, id=game_id)
    if request.user == game.player1:
        player_role = 'player1'
    else:
        player_role = 'player2'
    return render(request, 'game.html', { 'game_id': game_id, 'player_role': player_role })

def game_ia(request):
	mode = request.GET.get('mode', 'medium')
	return render(request, 'old/game-ia.html', { 'mode': mode })

@login_required
def matchmaking(request):
	return render(request, 'old/matchmaking.html')


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

			if old_avatar and old_avatar.url != '/media/default/avatar.png':
				if os.path.exists(old_avatar_path):
					os.remove(old_avatar_path)

			user.avatar.save(new_filename, new_avatar)

			return JsonResponse({'status': 'success', 'image_url': user.avatar.url})
		return JsonResponse({'status': 'error', 'errors': form.errors})
	return JsonResponse({'status': 'error', 'message': 'Invalid request'})


@login_required
def profile(request, user_id=None):
    if user_id is None:
        user_data = request.user
    else:
        user_data = get_object_or_404(User, id=user_id)

    last_games = Game.objects.filter(
        player1=user_data
    ).order_by('-created_at')[:4]

    scores = []
    for game in last_games:
        if game.player1 == user_data:
            user_score = game.score_player1
            opponent = game.player2 if game.player2 else None
            opponent_score = game.score_player2 if opponent else 0
        else:
            user_score = game.score_player2
            opponent = game.player1
            opponent_score = game.score_player1

        result = "Victory" if user_score > opponent_score else "Defeat"

        scores.append({
            'result': result,
            'opponent': opponent.username if opponent else "AI",
            'score': f"{user_score} - {opponent_score}",
            'created_at': game.created_at.strftime("%Y-%m-%d %H:%M")
        })

    return render(request, 'ProfilePage.html', {'user': user_data, 'scores': scores})



def leaderboard(request):
	leaderboard = User.objects.order_by('-elo_rating')[:10]
	print(leaderboard)
	return render(request, 'leaderboard.html', { 'leaderboard': leaderboard })

def game_modes(request):
	return render(request, 'GameModes.html')

def rules(request):
	return render(request, 'PongRules.html')

def signin(request):
	return render(request, 'SignIn.html')

def	aimode(request):
	return render(request, 'AIMode.html')

def	rankedmode(request):
	return render(request, 'RankedMode.html')

def	unrankedmode(request):
	return render(request, 'UnrankedMode.html')

def	rushmode(request):
	return render(request, 'RushMode.html')

def	tictactoe(request):
	return render(request, 'TicTacToe.html')

def	timermode(request):
	return render(request, 'TimerMode.html')

def	maxscoremode(request):
	return render(request, 'MaxScoreMode.html')

def	tounrnamentpage(request):
	return render(request, 'TournamentPage.html')

def	invitetournament(request):
	return render(request, 'InviteTournament.html')

def	jointournament(request):
	return render(request, 'JoinTournament.html')

def	pongtourny(request):
	return render(request, 'PongTourny.html')

def	newprofile(request):
	return render(request, 'NewProfilePage.html')

def	myfriends(request):
	return render(request, 'MyFriends.html')

def	error404(request):
	return render(request, 'Error404.html')
