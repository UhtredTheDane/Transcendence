python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser --noinput --username admin --email bidon93@live.fr
python manage.py createsuperuser --noinput --username admin2 --email bidon42@gmail.com
python manage.py runserver_plus 0.0.0.0:8000 \
    --cert-file /app/server.crt \
    --key-file /app/server.key