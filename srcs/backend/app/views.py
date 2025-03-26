import json
import requests
import random
import math
from math import log2
from django.conf import settings
from django.shortcuts import get_object_or_404, render, redirect
from django.http import HttpResponseNotFound, HttpResponseRedirect, HttpResponseForbidden, Http404, JsonResponse
from django.core.files.base import ContentFile
from django.contrib import messages
from django.contrib.auth import login, get_backends
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth.decorators import login_required
from django.db.models import F, Q
from django.views.decorators.csrf import csrf_exempt
from .models import User, Channel,  Message, Messages, Game, Tournament, TournamentGame, TournamentPlayer
from allauth.account.forms import LoginForm
from allauth.account.forms import SignupForm
from allauth.account.views import login as allauth_login
from allauth.account.views import signup as allauth_signup

API_42_AUTH_URL = "https://api.intra.42.fr/oauth/authorize"
API_42_TOKEN_URL = "https://api.intra.42.fr/oauth/token"
API_42_USER_URL = "https://api.intra.42.fr/v2/me"

def home(request):
	is_logged_in = request.user.is_authenticated
	top_players = User.objects.order_by('-elo_rating')[:10]
	return render(request, 'HomePage.html', { 'is_logged_in': is_logged_in, 'top_players': top_players })

def navbar(request):
	top_players = User.objects.order_by('-elo_rating')[:10]
	user = request.user if request.user.is_authenticated else None
	if (user and user.avatar.url):
		avatar_url = user.avatar.url
	else:
		avatar_url = '/media/default/avatar.png'

	return render(request, 'navbar.html', { 'avatar': avatar_url, 'top_players': top_players })


def leaderboard(request):
	top_players = User.objects.order_by('-elo_rating')[:10]
	data = list(top_players.values('username', 'elo_rating'))

	return JsonResponse(data, safe=False)

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
			players=current_user
			).filter(
					players=other_user
					).distinct()


	if not channel.exists():
		# Créer un nouveau channel
		channel = Channel.objects.create(name=f"Channel-{current_user.id}-{other_user.id}")
		channel.players.add(current_user, other_user)
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
	game_type = request.GET.get('type', 'unranked')  
	player1 = request.user

	try:
		if game_type == 'solo':
			game = Game.objects.create(
				player1=player1,
				mode='solo'
			)
		else:
			player2_id = request.GET.get('player2_id')
			if not player2_id:
				return JsonResponse({'error': 'player2_id is required'}, status=400)
			
			player2 = get_object_or_404(User, id=player2_id)
			game = Game.objects.create(
				player1=player1,
				player2=player2,
				mode=game_type
			)

		print(f"🎮 Game créée: ID={game.id}, Mode={game.mode}")

		has_to_redirect = request.GET.get('redirect', 'false')
		if has_to_redirect == 'true':
			if game_type == 'ranked':
				return redirect(f'/RankedMode/{game.id}/')
			elif game_type == 'tictactoe':
				return redirect(f'/TicTacToeMode/{game.id}/')
			elif game_type == 'rushmode':
				return redirect(f'/RushMode/{game.id}/')
			elif game_type == 'timermode':
				return redirect(f'/TimerMode/{game.id}/')
			elif game_type == 'maxscoremode':
				return redirect(f'/MaxScoreMode/{game.id}/')
			elif game_type == 'tournament':
				return redirect(f'/TournamentMode/{game.id}/')
			else:
				return redirect(f'/UnrankedMode/{game.id}/')
		
		return JsonResponse({ 'game_id': game.id })
			
	except Http404:
		return JsonResponse({'error': 'Opponent not found'}, status=404)
	except Exception as e:
		return JsonResponse({'error': str(e)}, status=500)

@login_required
def TicTacToeMode(request, game_id):
	try:
		game = Game.objects.get(id=game_id)
	except Game.DoesNotExist:
		return HttpResponseNotFound("Game not found")
	
	game.mode = 'tictactoe'
	game.save()
	if request.user == game.player1:
		player_role = 'player1'
	elif request.user == game.player2:
		player_role = 'player2'
	else:
		return HttpResponseForbidden("You are not part of this game.")

	return render(request, 'TicTacToe.html', {
		'game_id': game.id,
		'player_role': player_role,
		'username': request.user.username
	})

@login_required # ! POUR REVIEW LES FONCTIONS ET POUVOIRS LES DISPLAY DANS LE PROFIL
def RankedMode(request, game_id):
	game = get_object_or_404(Game, id=game_id)
	game.mode = 'ranked'  # ! Commande a modifier
	game.save() # ! Commande a ajouter

	player1_username = game.player1.username if game.player1 else "User"
	player2_username = game.player2.username if game.player2 else "Waiting for player"

	if request.user == game.player1:
		player_role = 'player1'
	else:
		player_role = 'player2'
	return render(request, 'RankedMode.html', { 'game_id': game_id, 'player_role': player_role, 'player1_username': player1_username,
		'player2_username': player2_username})

@login_required
def UnrankedMode(request, game_id):
	game = get_object_or_404(Game, id=game_id)
	if (game.mode != "tournament"):
		game.mode = 'unranked'  # Set mode to unranked
	game.save()

	player1_username = game.player1.username if game.player1 else "User"
	player2_username = game.player2.username if game.player2 else "Waiting for player"

	if request.user == game.player1:
		player_role = 'player1'
	else:
		player_role = 'player2'
	return render(request, 'UnrankedMode.html', {
		'game_id': game_id,
		'player_role': player_role,
		'player1_username': player1_username,
		'player2_username': player2_username
	})

@login_required
def TournamentMode(request, game_id):
	game = get_object_or_404(Game, id=game_id)
	game.mode = 'tournament'  # Set mode to tournament
	game.save()

	player1_username = game.player1.username if game.player1 else "User"
	player2_username = game.player2.username if game.player2 else "Waiting for player"

	if request.user == game.player1:
		player_role = 'player1'
	else:
		player_role = 'player2'
	return render(request, 'TournamentMode.html', {
		'game_id': game_id,
		'player_role': player_role,
		'player1_username': player1_username,
		'player2_username': player2_username
	})

@login_required
def RushMode(request, game_id):
	game = get_object_or_404(Game, id=game_id)
	game.mode = 'rushmode'  # Set mode to rushmode
	game.save()

	player1_username = game.player1.username if game.player1 else "User"
	player2_username = game.player2.username if game.player2 else "Waiting for player"
	if request.user == game.player1:
		player_role = 'player1'
	else:
		player_role = 'player2'
	return render(request, 'RushMode.html', { 'game_id': game_id, 'player_role': player_role, 'player1_username': player1_username,
		'player2_username': player2_username})

@login_required
def TimerMode(request, game_id):
	game = get_object_or_404(Game, id=game_id)
	game.mode = 'timermode'  # Set mode to timermode
	game.save()

	player1_username = game.player1.username if game.player1 else "User"
	player2_username = game.player2.username if game.player2 else "Waiting for player"
	if request.user == game.player1:
		player_role = 'player1'
	else:
		player_role = 'player2'
	return render(request, 'TimerMode.html', { 'game_id': game_id, 'player_role': player_role, 'player1_username': player1_username,
		'player2_username': player2_username})

@login_required
def MaxScoreMode(request, game_id):
	game = get_object_or_404(Game, id=game_id)
	game.mode = 'maxscoremode'  # Set mode to maxscoremode
	game.save()

	player1_username = game.player1.username if game.player1 else "User"
	player2_username = game.player2.username if game.player2 else "Waiting for player"
	if request.user == game.player1:
		player_role = 'player1'
	else:
		player_role = 'player2'
	return render(request, 'MaxScoreMode.html', { 'game_id': game_id, 'player_role': player_role, 'player1_username': player1_username,
		'player2_username': player2_username})

# 42
def auth_42_login(request):
	auth_url = (
			f"{API_42_AUTH_URL}?client_id={settings.FORTYTWO_CLIENT_ID}"
			f"&redirect_uri={settings.FORTYTWO_REDIRECT_URI}&response_type=code"
			)
	return redirect(auth_url)

def auth_42_callback(request):
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

	headers = {"Authorization": f"Bearer {access_token}"}
	user_response = requests.get(API_42_USER_URL, headers=headers)
	if user_response.status_code != 200:
		return JsonResponse({"error": "Failed to fetch user info"}, status=400)

	user_api_data = user_response.json()

	if (user_api_data["image"]["link"]):
		avatar_url = user_api_data["image"]["link"]
	else:
		avatar_url = "/media/default/avatar.png"

	user, created = User.objects.get_or_create(
			username=user_api_data["login"],
			defaults={
				"email": user_api_data.get("email", ""),
				"first_name": user_api_data.get("first_name", ""),
				"last_name": user_api_data.get("last_name", ""),
				"avatar": avatar_url
				},
			)

	if created and avatar_url != "/media/default/avatar.png":
		response = requests.get(avatar_url)
		if response.status_code == 200:
			avatar_filename = f"{user.username}.jpg"
			user.avatar.save(avatar_filename, ContentFile(response.content))
			user.save()

	backend = get_backends()[0]
	user.backend = f"{backend.__module__}.{backend.__class__.__name__}"

	login(request, user)
	return redirect("/ProfilePage/")

@login_required
def update_avatar(request):
	if request.method == 'POST' and request.FILES.get('avatar'):
		user = request.user
		uploaded_file = request.FILES['avatar']

		if user.avatar and user.avatar.name != 'default/avatar.png':
			user.avatar.delete(save=False)

		user.avatar.save(f"{user.username}_{uploaded_file.name}", uploaded_file)

		return JsonResponse({'status': 'success', 'image_url': user.avatar.url})

	return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)

@login_required
def profile(request, username=None):
    try:
        if username is None:
            user_data = request.user
        else:
            user_data = User.objects.get(username=username)

        user_games = Game.objects.filter((Q(player1=user_data) | Q(player2=user_data)) & Q(is_ended=True))

        wins = user_games.filter(
            (Q(player1=user_data) & Q(score_player1__gt=F('score_player2'))) |
            (Q(player2=user_data) & Q(score_player2__gt=F('score_player1')))
        ).count()

        losses = user_games.filter(
            (Q(player1=user_data) & Q(score_player1__lt=F('score_player2'))) |
            (Q(player2=user_data) & Q(score_player2__lt=F('score_player1')))
        ).count()

        ranked_games = user_games.filter(mode='ranked')
        unranked_games = user_games.filter(mode='unranked')
        tournament_games = user_games.filter(mode='tournament')
        tictactoe_games = user_games.filter(mode='tictactoe')

        def format_game_list(games):
            formatted_games = []
            for game in games:
                if game.player1 == user_data:
                    user_score = game.score_player1
                    opponent = game.player2
                    opponent_score = game.score_player2
                else:
                    user_score = game.score_player2
                    opponent = game.player1
                    opponent_score = game.score_player1

                result = "Victory" if user_score > opponent_score else "Defeat"
                formatted_games.append({
                    'result': result,
                    'user_score': user_score,
                    'opponent_score': opponent_score,
                    'opponent': opponent.username if opponent else 'AI'
                })
            return formatted_games

        tournaments = Tournament.objects.filter(players__user=user_data).distinct()

        context = {
            'user_data': user_data,
            'wins': wins,
            'losses': losses,
            'scores': format_game_list(user_games),
            'ranked_scores': format_game_list(ranked_games),
            'unranked_scores': format_game_list(unranked_games),
            'tictactoe_scores': format_game_list(tictactoe_games),
            'tournament_scores': format_game_list(tournament_games),
            'tournaments': json.dumps([
                {
                    'tournament_id': tournament.id,
                    'name': tournament.name,
                    'date': tournament.created_at.isoformat() if tournament.created_at else None,
                    # Ajoute d'autres champs si besoin
                } for tournament in tournaments
            ]),
            'is_own_profile': user_data == request.user,
            'viewing_username': username
        }

        return render(request, 'ProfilePage.html', context)
    except User.DoesNotExist:
        return redirect('Error404')

def get_messages(request, contact_username):
	if not request.user.is_authenticated:
		return JsonResponse({'error': 'Not authenticated'}, status=401)
	
	try:
		messages = Messages.objects.filter(
			Q(sender=request.user, receiver__username=contact_username) |
			Q(receiver=request.user, sender__username=contact_username)
		).order_by('timestamp')
		
		return JsonResponse({
			'messages': [{
				'sender': msg.sender.username,
				'content': msg.content,
				'timestamp': msg.timestamp.strftime('%H:%M')
			} for msg in messages]
		})
	except Exception as e:
		return JsonResponse({'error': str(e)}, status=500)


EXPRESS_SERVER_URL = "http://blockchain-node:3000"

def create_tournament_request(request):
	try:
		response = requests.post(f"{EXPRESS_SERVER_URL}/create-tournament")
		return response.json()
	except Exception as e:
		return {'status': 'error', 'message': str(e)}

# @csrf_exempt
# def create_tournament(request):
#     if request.method == 'POST':
#         try:
#             response = requests.post(f"{EXPRESS_SERVER_URL}/create-tournament")
			
#             return JsonResponse(response.json(), safe=False)
#         except Exception as e:
#             return JsonResponse({'status': 'error', 'message': str(e)})
#     return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

def leaderboard(request):
	leaderboard = User.objects.order_by('-elo_rating')[:10]
	return render(request, 'leaderboard.html', { 'leaderboard': leaderboard })

@login_required
def game_modes(request):
	return render(request, 'GameModes.html')

def rules(request):
	return render(request, 'PongRules.html')

def signin(request):
	form = LoginForm(data=request.POST or None, request=request)

	if request.method == "POST":
		if form.is_valid():
			allauth_login(request)
			if request.user.is_authenticated:
				return redirect("/ProfilePage/") 
		else:
			messages.error(request, "Identifiants invalides")

	return render(request, "SignIn.html", { "form": form })

def signup(request):
	form = SignupForm(request.POST or None)

	if request.method == "POST":
		if form.is_valid():
			allauth_signup(request)
			if request.user.is_authenticated:
				return redirect("/ProfilePage/")

	return render(request, "SignUp.html", { "form": form })

def	aimode(request):
	return render(request, 'AIMode.html')

def add_match(tournament_id, player1, player2, score1, score2, date):
    # Check if all required fields are present, explicitly checking for None
    # required_fields = [tournament_id, player1, player2, date]  # Don't include scores in the check
    # if any(field is None for field in required_fields):  # Explicitly check for None
    #     return JsonResponse({"status": "error", "message": "Missing required fields."})
    
    # Prepare payload for Express request, including the date
    payload = {
        "tournamentid": tournament_id,
        "player1": player1,
        "player2": player2,
        "score1": score1,
        "score2": score2,
        "date": date,
    }
    
    try:
        # Send POST request to Express server with a timeout
        response = requests.post(
            "http://blockchain-node:3000/add-match", 
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=10  # Set a timeout for the request
        )
        
        return JsonResponse(response.json())

    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)})


# Example call:
# add_match(tournament_id=1, player1="John", player2="Doe", score1=2, score2=1, date="2023-12-25")


def check_matches(request, tournament_id):  # Accepter tournament_id ici
	if request.method == "GET":
		try:
			# Envoyer la requête GET au serveur Express avec l'ID du tournoi
			response = requests.get(f"http://blockchain-node:3000/checkMatches/{tournament_id}")
			
			# Vérifier si la réponse est vide ou a un statut non valide
			if response.status_code != 200 or not response.text:
				return JsonResponse({"status": "error", "message": "Invalid response from blockchain service."})

			try:
				# Tenter de parser la réponse JSON
				data = response.json()
			except ValueError:
				return JsonResponse({"status": "error", "message": "Invalid JSON received from blockchain service."})

			# Retourner les données provenant du serveur Express
			return JsonResponse(data)
		except Exception as e:
			return JsonResponse({"status": "error", "message": str(e)})
	
	return JsonResponse({"status": "error", "message": "Invalid request method"})

def get_player_matches(request, tournament_id, player_name):
	url = f"http://blockchain-node:3000/getPlayerMatches/{tournament_id}/{player_name}"
	response = requests.get(url)

	if response.status_code != 200:
		return JsonResponse({
			'status': 'error',
			'message': 'Failed to fetch player matches from Express server',
			'error': response.json()
		})

	print(f"\nResponse:\n{response.json()}\n\n")
	matches = response.json().get('matches', [])
	user_ids = set()

	for match in matches:
		user_ids.add(int(match.get('player1')))
		user_ids.add(int(match.get('player2')))

	users = User.objects.filter(id__in=user_ids)
	for user in users:
		print(f"User: {user.username}")
	id_to_data = {
		user.id: {
			"username": user.username,
			"avatar": user.avatar.url if user.avatar else "/media/default/avatar.png"
		}
		for user in users
	}

	for match in matches:
		match['player1'] = int(match['player1']) if match.get('player1') else None
		match['player2'] = int(match['player2']) if match.get('player2') else None

		match['player1_username'] = id_to_data.get(match.get('player1'), {}).get('username', 'Unknown')
		match['player2_username'] = id_to_data.get(match.get('player2'), {}).get('username', 'Unknown')
		match['player1_avatar'] = id_to_data.get(match.get('player1'), {}).get('avatar', '/media/default/avatar.png')
		match['player2_avatar'] = id_to_data.get(match.get('player2'), {}).get('avatar', '/media/default/avatar.png')

	print(f"\nMatches:\n{matches}\n\n")
	return JsonResponse({ "matches": matches })


@login_required
def set_ready_status(request, tournament_id):
	tournament = get_object_or_404(Tournament, id=tournament_id)
	player = get_object_or_404(TournamentPlayer, tournament=tournament, user=request.user)

	# Toggle le statut de ready
	player.is_ready = not player.is_ready
	player.save()

	return JsonResponse({ "status": "success", "is_ready": player.is_ready })

def create_bracket(tournament, players):
	total_players = len(players)
	total_rounds = int(math.log2(total_players))

	# Shuffle
	random.shuffle(players)

	# Liste finale contenant tous les matchs par round
	games_by_round = [[] for _ in range(total_rounds)]

	# Créer les matchs du premier round
	first_round = []
	for i in range(0, total_players, 2):
		game = Game.objects.create(
			player1=players[i],
			player2=players[i + 1],
			mode='tournament',
			is_active=False
		)
		tg = TournamentGame.objects.create(
			tournament=tournament,
			game=game,
			round_number=1
		)
		first_round.append(tg)
	games_by_round[0] = first_round

	# Créer les matchs suivants en respectant la hiérarchie
	for round_number in range(2, total_rounds + 1):
		prev_round = games_by_round[round_number - 2]
		current_round = []

		for i in range(0, len(prev_round), 2):
			# Ce match sera alimenté par les gagnants des 2 matchs précédents
			game = Game.objects.create(
				player1=None,
				player2=None,
				mode='tournament',
				is_active=False
			)
			tg = TournamentGame.objects.create(
				tournament=tournament,
				game=game,
				round_number=round_number
			)
			current_round.append(tg)

		games_by_round[round_number - 1] = current_round

	return games_by_round


@login_required
def create_tournament(request):
	if request.method == "POST":
		data = json.loads(request.body)
		tournament_name = data.get("name", "")
		selected_players = data.get("players", [])

		# Vérification du nombre de joueurs
		if len(selected_players) not in [4, 8, 16]:
			return JsonResponse({ "status": "error", "message": "You must select 4, 8, or 16 players." })

		# Vérifier si tous les utilisateurs existent
		existing_users = User.objects.filter(username__in=selected_players)
		if existing_users.count() != len(selected_players):
			return JsonResponse({
				"status": "error",
				"message": "One or more players do not exist."
			})

		shuffled_players = random.sample(list(existing_users), len(existing_users))

		tournament = Tournament.objects.create(creator=request.user, name=tournament_name)
		
		bracket = create_bracket(tournament, list(existing_users))
		tournament_response = create_tournament_request(request)
		if tournament_response.get('status') == 'error':
			return JsonResponse({'status': 'error', 'message': tournament_response.get('message')})

		for idx, user in enumerate(existing_users):
			TournamentPlayer.objects.create(tournament=tournament, user=user, position=idx + 1)

		return JsonResponse({ "status": "success", "tournament_id": tournament.id })

	return JsonResponse({ "status": "error", "message": "Invalid request method." })

def get_winner(match):
	if match["player1"]["score"] > match['player2']["score"]:
		return {
			'id': match['player1']["id"],
			'username': match['player1']["username"],
			'avatar': match['player1']["avatar"],
			'score': 0 
		}
	elif match['player2']["score"] > match["player1"]['score']:
		return {
			'id': match['player2']["id"],
			'username': match['player2']['username'],
			'avatar': match['player2']['avatar'],
			'score': 0
		}
	else:
		return None

@login_required
def tournamentpage(request, tournament_id):
	tournament = get_object_or_404(Tournament, id=tournament_id)
	players = TournamentPlayer.objects.filter(tournament=tournament).select_related("user")
	games = TournamentGame.objects.filter(tournament=tournament).select_related("game")

	players_data = [
		{
			"id": player.user.id,
			"username": player.user.username,
			"avatar": player.user.avatar.url,
			"is_ready": player.is_ready,
			"joined_at": player.joined_at.isoformat(),
			"position": player.position,
			'is_current_user': player.user == request.user
		}
		for player in players
	]

	# for game in games:
	# 	print(f"Game:\n{game.game}\n\nPlayer1: {game.game.player1}\nPlayer2: {game.game.player2}\n\n--------------\n\n")

	matches_data = [
		{
			"id": game.game.id,
			"player1": {
				"id": game.game.player1.id if game.game.player1 else None,
				"username": game.game.player1.username if game.game.player1 else "TBD",
				"avatar": game.game.player1.avatar.url if game.game.player1 else "/media/default/avatar.png",
				"score": game.game.score_player1
			},
			"player2": {
				"id": game.game.player2.id if game.game.player2 else None,
				"username": game.game.player2.username if game.game.player2 else "TBD",
				"avatar": game.game.player2.avatar.url if game.game.player2 else "/media/default/avatar.png",
				"score": game.game.score_player2
			},
			"created_at": game.game.created_at.isoformat(),
		}
		for game in games
	]

	is_participant = TournamentPlayer.objects.filter(tournament=tournament, user=request.user).exists() or request.user == tournament.creator
	if not is_participant:
		return HttpResponseForbidden("You are not a participant in this tournament.")

	games_by_round = {}
	for tg in games:
		round_num = tg.round_number
		if round_num not in games_by_round:
			games_by_round[round_num] = []

		game_data = {
			"id": tg.game.id,
			"player1": {
				"id": tg.game.player1.id if tg.game.player1 else None,
				"username": tg.game.player1.username if tg.game.player1 else "To Be Determined",
				"avatar": tg.game.player1.avatar.url if tg.game.player1 else "/media/default/avatar.png",
				"score": tg.game.score_player1,
				"is_determined": True if tg.game.player1 else None
			},
			"player2": {
				"id": tg.game.player2.id if tg.game.player2 else None,
				"username": tg.game.player2.username if tg.game.player2 else "To Be Determined",
				"avatar": tg.game.player2.avatar.url if tg.game.player2 else "/media/default/avatar.png",
				"score": tg.game.score_player2,
				"is_determined": True if tg.game.player2 else None
			},
			"is_ended": tg.game.is_ended,
			"created_at": tg.game.created_at.isoformat(),
		}
		games_by_round[round_num].append(game_data)

	rounds = [games_by_round[r] for r in sorted(games_by_round.keys())]

	num_players = len(players)
	if num_players == 4:
		round_names = ["Demi-finales", "Finale"]
	elif num_players == 8:
		round_names = ["Quarts de finale", "Demi-finales", "Finale"]
	elif num_players == 16:
		round_names = ["Huitièmes de finale", "Quarts de finale", "Demi-finales", "Finale"]
	else:
		round_names = [f"Round {i+1}" for i in range(len(rounds))]

	# print(rounds)

	return render(request, 'TournamentPage.html', {
		'players': json.dumps(players_data),
		'matches': json.dumps(matches_data),
		'rounds': json.dumps(rounds),
		'round_names': json.dumps(round_names),
		'tournament_id': tournament.id,
		'tournament_name': tournament.name,
	})
	
from datetime import datetime

def convert_date_to_unix(date_string):
    # Assuming the date_string is in the format '2025-03-24 14:29:12.057151+00:00'
    dt = datetime.strptime(date_string.split('.')[0], '%Y-%m-%d %H:%M:%S')
    # Convert to Unix timestamp
    return int(dt.timestamp())
	
@login_required
def	invitetournament(request):
	return render(request, 'InviteTournament.html')

@login_required
def jointournament(request):
	created_tournaments = Tournament.objects.filter(creator=request.user)
	joined_tournaments = Tournament.objects.filter(players__user=request.user)

	all_tournaments = (created_tournaments | joined_tournaments).distinct()

	tournaments_data = [
		{
			"id": tournament.id,
			"name": tournament.name or f"Tournament {tournament.id}",
			"created_at": tournament.created_at.isoformat()
		}
		for tournament in all_tournaments
	]

	print(tournaments_data)

	return render(request, 'JoinTournament.html', {
		"tournaments": json.dumps(tournaments_data)
	})


@login_required
def	myfriends(request):
	return render(request, 'MyFriends.html')

def	error404(request):
	return render(request, 'Error404.html')

@login_required
def	passwordreset(request):
	return render(request, 'PasswordReset.html')

@login_required
def	matchmaking(request):
	return render(request, 'MatchMaking.html')

@login_required
def	ChallengeMode(request):
	return render(request, 'ChallengeMode.html')

# def profile_view(request):
# 	context = {
# 		'ranked_scores': Game.objects.filter(game_type='ranked'),
# 		'unranked_scores': Game.objects.filter(game_type='unranked'),
# 		'tournament_scores': Game.objects.filter(game_type='tournament'),
# 		'tournaments': Game.objects.filter(game_type='tournament'),
# 		'tictactoe_scores': Game.objects.filter(game_type='tictactoe'),
# 	}
# 	return render(request, 'ProfilePage.html', context)