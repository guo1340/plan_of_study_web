# Generated by Django 4.2.6 on 2024-03-25 16:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('classes', '0005_rename_class_course'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='course',
            name='prereq',
        ),
        migrations.AddField(
            model_name='course',
            name='prereqs',
            field=models.ManyToManyField(blank=True, related_name='prerequisite_for', to='classes.course'),
        ),
    ]