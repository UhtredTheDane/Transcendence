FROM python:latest

WORKDIR /django
RUN apt-get update -y && apt-get upgrade -y
#RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
    #&& apt-get install -y postgresql-client
COPY requirements.txt .
RUN pip install python-decouple
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "manage.py", "runserver"]

#CMD [ "/bin/bash", "./start_django.sh" ]