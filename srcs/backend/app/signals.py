# signals.py
import requests
from app.models import Game, TournamentGame
from django.dispatch import receiver
from django.core.files.base import ContentFile
from django.db.models.signals import post_save
from allauth.account.signals import user_signed_up
from allauth.socialaccount.models import SocialAccount
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

@receiver(user_signed_up)
def save_profile_picture_on_signup(request, user, **kwargs):
	try:
		social_account = SocialAccount.objects.get(user=user, provider='google')
	except SocialAccount.DoesNotExist:
		social_account = None

	if social_account:
		picture_url = social_account.get_avatar_url()
		if picture_url:
			resp = requests.get(picture_url)
			if resp.status_code == 200:
				filename = f"user_{user.id}.jpg"
				user.avatar.save(filename, ContentFile(resp.content), save=True)

@receiver(post_save, sender=Game)
def handle_game_completion(sender, instance, **kwargs):
	if instance.mode == 'tournament' and not instance.is_active:
		try:
			tournament_game = TournamentGame.objects.get(game=instance)
			tournament = tournament_game.tournament
			
			# Vérifier si tous les matchs du round sont terminés
			current_round_games = TournamentGame.objects.filter(
				tournament=tournament,
				round_number=tournament_game.round_number
			)
			
			if all(not g.game.is_active for g in current_round_games):
				# Créer les matchs du round suivant
				winners = []
				for game in current_round_games:
					winner = game.game.player1 if game.game.score_player1 > game.game.score_player2 else game.game.player2
					winners.append(winner)
				
				# Créer les nouveaux matchs
				next_round = tournament_game.round_number + 1
				new_matches = []
				for i in range(0, len(winners), 2):
					player1 = winners[i]
					player2 = winners[i+1] if i+1 < len(winners) else None
					
					new_game = Game.objects.create(
						player1=player1,
						player2=player2,
						mode='tournament',
						is_active=False
					)
					tg = TournamentGame.objects.create(
						tournament=tournament,
						game=new_game,
						round_number=next_round
					)
					new_matches.append(new_game.id)

				# Notifier tous les clients du tournoi
				channel_layer = get_channel_layer()
				async_to_sync(channel_layer.group_send)(
					f"tournament_{tournament.id}",
					{
						"type": "tournament.update",
						"event": "new_round",
						"new_matches": new_matches,
						"round": next_round
					}
				)
					
		except TournamentGame.DoesNotExist:
			pass