# Generated by Django 4.2.6 on 2024-11-04 18:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('classes', '0014_delete_season_alter_course_seasons'),
    ]

    operations = [
        migrations.AlterField(
            model_name='course',
            name='class_number',
            field=models.IntegerField(default='4000'),
        ),
    ]
