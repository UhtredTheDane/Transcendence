import os
import uuid
import base64
import json
import requests
import subprocess

from django.conf import settings
from django.shortcuts import get_object_or_404, render, redirect
from django.http import HttpResponse, HttpResponseNotFound, HttpResponseRedirect, Http404, JsonResponse
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.contrib.auth import authenticate, login, logout, get_backends
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.db.models import F
from allauth.socialaccount.models import SocialAccount
from .models import User, Channel, ChannelUser, Message, Game
from app.tests import Test
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

API_42_AUTH_URL = "https://api.intra.42.fr/oauth/authorize"
API_42_TOKEN_URL = "https://api.intra.42.fr/oauth/token"
API_42_USER_URL = "https://api.intra.42.fr/v2/me"

def home(request):
	is_logged_in = request.user.is_authenticated
	return render(request, 'HomePage.html', { 'is_logged_in': is_logged_in })

def navbar(request):
	user = request.user if request.user.is_authenticated else None
	if (user and user.avatar.url):
		avatar_url = user.avatar.url
	else:
		avatar_url = '/media/default/avatar.png'

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
	print("Hello function create_game")
    
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
	return render(request, 'RankedMode.html', { 'game_id': game_id, 'player_role': player_role })

def game_ia(request):
	mode = request.GET.get('mode', 'medium')
	return render(request, 'old/game-ia.html', { 'mode': mode })

@login_required
def matchmaking2(request):
	return render(request, 'old/matchmaking.html')


# 42
def auth_42_login(request):
	"""Redirige l'utilisateur vers la page d'authentification de 42."""
	auth_url = (
		f"{API_42_AUTH_URL}?client_id={settings.FORTYTWO_CLIENT_ID}"
		f"&redirect_uri={settings.FORTYTWO_REDIRECT_URI}&response_type=code"
	)
	return redirect(auth_url)

def auth_42_callback(request):
	"""Gère le callback OAuth2 après la connexion de l'utilisateur."""
	code = request.GET.get("code")
	if not code:
		return JsonResponse({"error": "No code provided"}, status=400)

	# Échange du code contre un token
	data = {
		"grant_type": "authorization_code",
		"client_id": settings.FORTYTWO_CLIENT_ID,
		"client_secret": settings.FORTYTWO_CLIENT_SECRET,
		"code": code,
		"redirect_uri": settings.FORTYTWO_REDIRECT_URI,
	}
	response = requests.post(API_42_TOKEN_URL, data=data)
	if response.status_code != 200:
		return JsonResponse({"error": "Failed to fetch token"}, status=400)

	token_data = response.json()
	access_token = token_data.get("access_token")

	# Récupération des infos de l'utilisateur
	headers = {"Authorization": f"Bearer {access_token}"}
	user_response = requests.get(API_42_USER_URL, headers=headers)
	if user_response.status_code != 200:
		return JsonResponse({"error": "Failed to fetch user info"}, status=400)

	user_data = user_response.json()
	
	# Vérification si l'utilisateur existe déjà
	user, created = User.objects.get_or_create(
		username=user_data["login"],
		defaults={
			"email": user_data.get("email", ""),
			"first_name": user_data.get("first_name", ""),
			"last_name": user_data.get("last_name", ""),
		},
	)
	
	backend = get_backends()[0]  # Prend le premier backend configuré
	user.backend = f"{backend.__module__}.{backend.__class__.__name__}"

	# Connexion de l'utilisateur
	login(request, user)
	return redirect("/ProfilePage/")


# Profile
@login_required
def update_avatar(request):
	if request.method == 'POST' and request.FILES.get('avatar'):
		user = request.user
		uploaded_file = request.FILES['avatar']

		# Supprimer l'ancien avatar s'il n'est pas l'avatar par défaut
		if user.avatar and user.avatar.name != 'default/avatar.png':
			user.avatar.delete(save=False)

		# Sauvegarde du fichier dans MEDIA_ROOT/avatars/
		user.avatar.save(f"{user.username}_{uploaded_file.name}", uploaded_file)

		return JsonResponse({'status': 'success', 'image_url': user.avatar.url})

	return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)


@login_required
def profile(request, user_id=None):
    if user_id is None:
        user_data = request.user
    else:
        user_data = get_object_or_404(User, id=user_id)

    user_games = Game.objects.filter(player1=user_data)

    wins = user_games.filter(score_player1__gt=F('score_player2')).count()
    losses = user_games.filter(score_player1__lt=F('score_player2')).count()

    last_games = user_games.order_by('-created_at')[:4]

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

    return render(request, 'ProfilePage.html', {
        'user': user_data,
        'scores': scores,
        'wins': wins,
        'losses': losses
    })
    return JsonResponse({"error": str(e)}, status=400)

import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

# Express server URL (Hardhat container should expose this service)
EXPRESS_SERVER_URL = "http://blockchain-node:3000"

@csrf_exempt
def create_tournament(request):
    if request.method == 'POST':
        try:
            # Send a POST request to the Express server for creating a tournament
            response = requests.post(f"{EXPRESS_SERVER_URL}/create-tournament")
            
            # Return the response from Express server
            return JsonResponse(response.json(), safe=False)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

@csrf_exempt
def add_match(request):
    if request.method == 'POST':
        # Extract parameters from the request (tournament ID, player names, scores)
        tournament_id = request.POST.get('tournament_id')
        player1 = request.POST.get('player1')
        player2 = request.POST.get('player2')
        score1 = request.POST.get('score1')
        score2 = request.POST.get('score2')
        
        try:
            # Send a POST request to the Express server to add a match
            data = {
                'tournamentid': tournament_id,
                'player1': player1,
                'player2': player2,
                'score1': score1,
                'score2': score2
            }
            response = requests.post(f"{EXPRESS_SERVER_URL}/add-match", json=data)
            
            # Return the response from thse Express server
            return JsonResponse(response.json(), safe=False)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

@csrf_exempt
def check_matches(request):
    try:
        # Get tournament_id from the query string
        tournament_id = request.GET.get('tournament_id')
        
        if not tournament_id:
            return JsonResponse({"status": "error", "message": "Tournament ID is required"}, status=400)
        
        # Send GET request to the Express server
        response = requests.get(f"{EXPRESS_SERVER_URL}/checkMatches/", params={"tournament_id": tournament_id})
        
        # Check if the response is valid JSON
        if response.status_code == 200:
            return JsonResponse(response.json(), status=response.status_code)
        else:
            return JsonResponse({"status": "error", "message": "Failed to fetch matches"}, status=response.status_code)
        
    except requests.exceptions.RequestException as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)


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

def	signup(request):
	return render(request, 'SignUp.html')

def	passwordreset(request):
	return render(request, 'PasswordReset.html')

def	tictactoe(request):
	return render(request, 'TicTacToe.html')

def	matchmaking(request):
	return render(request, 'MatchMaking.html')