FROM python:3.10.1-alpine

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN apk update \
&& apk add postgresql-dev gcc python3-dev musl-dev \
&& pip install --upgrade pip

COPY . /app/

RUN pip install -r requirements.txt

EXPOSE 8000

# CMD ["gunicorn", "--bind", "8000", "--workers", "3", "transcendance.wsgi:application"]
# CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
CMD [ "sh", "./start_django.sh" ]   