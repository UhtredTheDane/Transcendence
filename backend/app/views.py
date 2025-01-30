from django.shortcuts import render, redirect
from django.http import HttpResponse, HttpResponseNotFound, JsonResponse
from .models import User, Channel, Message
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

def chat(request):
	return render(request, 'chat/index.html')

def matchmaking(request):
	return render(request, 'matchmaking.html')

def success(request):
	return render(request, 'game/success.html')

def details(request):
	return HttpResponse('Details page')
