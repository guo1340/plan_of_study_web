# Generated by Django 4.2.6 on 2024-11-04 18:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('requirement', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='requirement',
            name='attribute_value',
            field=models.CharField(default='', max_length=100),
        ),
    ]