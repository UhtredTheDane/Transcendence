python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser --noinput --username admin --email bidon93@live.fr
python manage.py createsuperuser --noinput --username admin2 --email bidon42@gmail.com
uvicorn base.asgi:application --host 0.0.0.0 --port 8000 --reload --ssl-keyfile=/etc/ssl/private/server.key --ssl-certfile=/etc/ssl/certs/server.crt 
