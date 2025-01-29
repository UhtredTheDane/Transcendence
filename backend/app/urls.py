from django.contrib import admin
from django.urls import path, include
from app.views import index, details
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('', index),
	path('details/', details)
]
