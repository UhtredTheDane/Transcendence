from django.shortcuts import render, redirect
from rest_framework import generics
from datetime import datetime
from app.models import User
from app.serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny

# Create your views here.
def index(request):
	# if (request.method == 'POST'):
	# 	username = request.POST.get('content')
	# 	if username:  # Si le champ n'est pas vide
	# 		User.objects.create(username=username)  # Crée l'utilisateur
	# 	return redirect('/')
		
	content = {}
	content['users'] = User.objects.all()
	return render(request, 'index.html', context=content)

def details(request):
	return HttpResponse('Details page')


# def index(request):
# 	if (request.method == 'POST'):
# 		content = request.POST.get('content')
# 		user = request.user

# 		Message.objects.create(content=content, user=user)

# 	content = {}
# 	content['messages'] = Message.objects.order_by('-created_at')
# 	return render(request, 'index.html', context=content)

# def details(request):
# 	return HttpResponse('Details page')