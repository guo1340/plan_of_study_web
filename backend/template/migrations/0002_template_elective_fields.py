# Generated by Django 4.2.6 on 2024-07-02 22:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('elective_field', '0001_initial'),
        ('template', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='template',
            name='elective_fields',
            field=models.ManyToManyField(default=None, to='elective_field.electivefield'),
        ),
    ]
