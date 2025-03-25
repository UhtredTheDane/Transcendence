FROM python:3.10.1-alpine

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV DJANGO_SETTINGS_MODULE=base.settings

RUN apk update \
&& apk add postgresql-dev gcc python3-dev musl-dev openssl
RUN pip install --upgrade pip

COPY . /app/

RUN pip install -r requirements.txt
RUN pip install 'uvicorn[standard]'
RUN mkdir -p /etc/ssl/private && mkdir -p /etc/ssl/certs && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/ssl/private/server.key \
        -out /etc/ssl/certs/server.crt \
        -subj "/CN=transcendence.local/O=Transcendence/C=FR"
# RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout server.key -out server.crt -subj "/CN=localhost/O=Local/C=FR"

EXPOSE 8000
# CMD ["gunicorn", "--bind", "8000", "--workers", "3", "transcendance.wsgi:application"]
# CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
# CMD ["uvicorn", "base.asgi:application", "--host", "0.0.0.0", "--port", "8000", "--ssl-keyfile", "/etc/ssl/private/server.key", "--ssl-certfile", "/etc/ssl/certs/server.crt"]
CMD [ "sh", "./start_django.sh" ]   
