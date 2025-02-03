# Generated by Django 5.1.5 on 2025-01-30 12:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='elo_rating',
            field=models.IntegerField(default=1000),
        ),
        migrations.AddField(
            model_name='user',
            name='is_waiting',
            field=models.BooleanField(default=False),
        ),
    ]
