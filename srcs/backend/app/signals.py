# signals.py
import requests
from django.dispatch import receiver
from django.core.files.base import ContentFile
from allauth.account.signals import user_signed_up
from allauth.socialaccount.models import SocialAccount

@receiver(user_signed_up)
def save_profile_picture_on_signup(request, user, **kwargs):
    try:
        social_account = SocialAccount.objects.get(user=user, provider='google')
    except SocialAccount.DoesNotExist:
        social_account = None

    if social_account:
        picture_url = social_account.get_avatar_url()  # équivaut à extra_data.get('picture')
        if picture_url:
            resp = requests.get(picture_url)
            if resp.status_code == 200:
                filename = f"user_{user.id}.jpg"
                user.avatar.save(filename, ContentFile(resp.content), save=True)
