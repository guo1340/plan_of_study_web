# Generated by Django 4.2.6 on 2024-10-25 20:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('template', '0005_remove_template_requirements_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='template',
            name='abbreviation',
            field=models.CharField(default='', max_length=100),
        ),
    ]