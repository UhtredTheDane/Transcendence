python manage.py makemigrations
python manage.py migrate
python manage.py shell < app/initialize.py
uvicorn base.asgi:application --host 0.0.0.0 --port 8000 --reload --ssl-keyfile=/etc/ssl/private/server.key --ssl-certfile=/etc/ssl/certs/server.crt --log-level warning
