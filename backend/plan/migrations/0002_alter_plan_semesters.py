# Generated by Django 4.2.6 on 2024-07-16 20:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('semester', '0002_remove_semester_season_semester_season'),
        ('plan', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='plan',
            name='semesters',
            field=models.ManyToManyField(blank=True, to='semester.semester'),
        ),
    ]