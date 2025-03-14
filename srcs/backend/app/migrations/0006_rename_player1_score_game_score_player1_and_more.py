# Generated by Django 5.1.5 on 2025-01-30 19:39

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0005_game_ball_x_game_ball_y_game_player1_y_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='game',
            old_name='player1_score',
            new_name='score_player1',
        ),
        migrations.RenameField(
            model_name='game',
            old_name='player2_score',
            new_name='score_player2',
        ),
        migrations.RemoveField(
            model_name='game',
            name='loser',
        ),
        migrations.RemoveField(
            model_name='game',
            name='type',
        ),
        migrations.RemoveField(
            model_name='game',
            name='winner',
        ),
        migrations.AddField(
            model_name='game',
            name='is_active',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='game',
            name='mode',
            field=models.CharField(choices=[('solo', 'Solo (contre IA)'), ('multiplayer', 'Multijoueur')], default='multiplayer', max_length=50),
        ),
        migrations.AlterField(
            model_name='game',
            name='player1',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='games_as_player1', to=settings.AUTH_USER_MODEL),
        ),
    ]
