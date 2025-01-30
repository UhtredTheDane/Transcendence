from django.shortcuts import get_object_or_404, render, redirect
from django.http import HttpResponse, HttpResponseNotFound, HttpResponseRedirect, JsonResponse
from .models import User, Channel, ChannelUser, Message, Game
from app.tests import Test

# Create your views here.
def index(request):
	# if (request.method == 'POST'):
	# 	username = request.POST.get('content')
	# 	if username:  # Si le champ n'est pas vide
	# 		User.objects.create(username=username)  # Crée l'utilisateur
	# 	return redirect('/')

	# Test.test()

	content = {}
	content['users'] = User.objects.all()
	return render(request, 'index.html', context=content)

def create_or_get_channel(request, user_id):
    other_user = get_object_or_404(User, id=user_id)
    current_user = request.user

    # Chercher si un channel existe déjà entre les deux utilisateurs
    channel = Channel.objects.filter(
        participants__in=[current_user, other_user]
    ).distinct()

    if not channel.exists():
        # Créer un nouveau channel
        channel = Channel.objects.create(name=f"Channel-{current_user.id}-{other_user.id}")
        channel.participants.add(current_user, other_user)
        channel.save()
    else:
        channel = channel.first()

    return redirect(f"/channel/{channel.id}/")

def channel_page(request, channel_id):
    # Récupérer le salon et ses messages
    channel = Channel.objects.get(id=channel_id)
    messages = channel.messages.all()

    return render(request, 'channel_page.html', {
        'channel': channel,
        'messages': messages
    })

def send_message(request, channel_id):
    channel = Channel.objects.get(id=channel_id)
    
    if request.method == 'POST':
        message_content = request.POST['message']
        Message.objects.create(channel=channel, user=request.user, content=message_content)
    
    return HttpResponseRedirect(request.META.get('HTTP_REFERER'))

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
            return JsonResponse({'error': 'player2_id is required for multiplayer mode'}, status=400)
        player2 = User.objects.get(id=player2_id)
        game = Game.objects.create(player1=player1, player2=player2, mode='multiplayer')

    return JsonResponse({'game_id': game.id})

def game(request):
	return render(request, 'game.html')

def matchmaking(request):
	return render(request, 'matchmaking.html')
