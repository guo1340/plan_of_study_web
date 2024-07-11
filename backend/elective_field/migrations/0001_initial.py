# Generated by Django 4.2.6 on 2024-07-02 22:15

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='ElectiveField',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('type_name', models.CharField(default='Area')),
                ('major', models.TextField(default='')),
                ('field_name', models.CharField(default='test')),
                ('field_number', models.IntegerField(default=-1)),
            ],
        ),
    ]
