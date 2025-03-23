from app.models import User

if not User.objects.filter(username='sofian').exists():
    User.objects.create_user(username='sofian', email='sofian@mail.fr', password='toto752631')

if not User.objects.filter(username='sofian1').exists():
    User.objects.create_user(username='sofian1', email='sofian1@mail.fr', password='toto752631')

if not User.objects.filter(username='soso').exists():
    User.objects.create_user(username='soso', email='soso@mail.fr', password='toto752631')

if not User.objects.filter(username='john').exists():
    User.objects.create_user(username='john', email='john@mail.fr', password='toto752631')

if not User.objects.filter(username='doe').exists():
    User.objects.create_user(username='doe', email='doe@mail.fr', password='toto752631')

if not User.objects.filter(username='n').exists():
    User.objects.create_user(username='n', email='n@mail.fr', password='toto752631')
