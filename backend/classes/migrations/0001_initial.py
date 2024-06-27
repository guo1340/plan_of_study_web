# Generated by Django 5.0.1 on 2024-02-09 19:06

import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Class',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('major', models.CharField(max_length=50)),
                ('abbreviation', models.CharField(max_length=150)),
                ('prereq', models.CharField(max_length=50)),
                ('term', models.CharField(max_length=50)),
                ('coreq', models.CharField(max_length=50)),
                ('description', models.TextField()),
                ('credits', models.IntegerField(default=0)),
                ('editable_credits', models.BooleanField(default=False)),
                ('elective_field', models.JSONField(default=list)),
                ('elective_field_name', models.CharField(max_length=50)),
            ],
        ),
    ]