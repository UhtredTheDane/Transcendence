"""
ASGI config for base project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/

"""
# base/asgi.py
# isort: skip_file
import os
from django.core.asgi import get_asgi_application
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'base.settings')

asgi_application = get_asgi_application()
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
import app.routing, app.consumers


application = ProtocolTypeRouter({
    "http": asgi_application,
    'websocket': AuthMiddlewareStack(
        URLRouter(
            app.routing.websocket_urlpatterns,
        )
    ),
})
