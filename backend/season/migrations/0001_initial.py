# Generated by Django 4.2.6 on 2024-07-12 22:24

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Season',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(choices=[('FALL', 'Fall'), ('SPRING', 'Spring'), ('SUMMER', 'Summer'), ('WINTER', 'Winter')], default='FALL', max_length=20)),
            ],
        ),
    ]
