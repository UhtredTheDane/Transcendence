from django.shortcuts import render
from datetime import datetime

# Create your views here.
def index(request):
	content = {}
	return render(request, 'index.html', context=content)







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