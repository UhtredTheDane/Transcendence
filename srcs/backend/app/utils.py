from django.core.cache import cache

def is_user_online(user_id):
    return cache.get(f"user_{user_id}_online", False)