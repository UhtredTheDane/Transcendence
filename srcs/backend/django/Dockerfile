FROM python:latest

WORKDIR /django
RUN apt-get update -y && apt-get upgrade -y && apt -y install wget
RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
    #&& apt-get install -y postgresql-client
RUN pip install django
COPY . .

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

#CMD [ "/bin/bash", "./start_django.sh" ]