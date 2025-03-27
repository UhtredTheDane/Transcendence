from app.models import User

if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser(username='admin', email='admin@mail.fr', password='toto752631')
    
if not User.objects.filter(username='admin2').exists():
    User.objects.create_superuser(username='admin2', email='admin2@mail.fr', password='toto752631')

if not User.objects.filter(username='sofian').exists():
    User.objects.create_superuser(username='sofian', email='sofian@mail.fr', password='toto752631')

if not User.objects.filter(username='sofian2').exists():
    User.objects.create_superuser(username='sofian2', email='sofian2@mail.fr', password='toto752631')

if not User.objects.filter(username='soso').exists():
    User.objects.create_superuser(username='soso', email='soso@mail.fr', password='toto752631')

if not User.objects.filter(username='john').exists():
    User.objects.create_superuser(username='john', email='john@mail.fr', password='toto752631')

if not User.objects.filter(username='doe').exists():
    User.objects.create_superuser(username='doe', email='doe@mail.fr', password='toto752631')

if not User.objects.filter(username='n').exists():
    User.objects.create_superuser(username='n', email='n@mail.fr', password='toto752631')
    
if not User.objects.filter(username='nils').exists():
    User.objects.create_superuser(username='nils', email='nils@mail.fr', password='toto752631')
    
if not User.objects.filter(username='youva').exists():
    User.objects.create_superuser(username='youva', email='youva@mail.fr', password='toto752631')
    
if not User.objects.filter(username='clement').exists():
    User.objects.create_superuser(username='clement', email='clement@mail.fr', password='toto752631')
    
if not User.objects.filter(username='alexis').exists():
    User.objects.create_superuser(username='alexis', email='alexis@mail.fr', password='toto752631')
    
if not User.objects.filter(username='yanis').exists():
    User.objects.create_superuser(username='yanis', email='yanis@mail.fr', password='toto752631')
    
if not User.objects.filter(username='nabil').exists():
    User.objects.create_superuser(username='nabil', email='nabil@mail.fr', password='toto752631')
    
if not User.objects.filter(username='sami').exists():
    User.objects.create_superuser(username='sami', email='sami@mail.fr', password='toto752631')
    
if not User.objects.filter(username='enis').exists():
    User.objects.create_superuser(username='enis', email='enis@mail.fr', password='toto752631')
    
if not User.objects.filter(username='tournament').exists():
    User.objects.create_superuser(username='tournament', email='admin@mail.fr', password='toto752631')