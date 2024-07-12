# Generated by Django 4.2.6 on 2024-07-12 21:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('classes', '0012_remove_course_term_course_season'),
    ]

    operations = [
        migrations.CreateModel(
            name='Season',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=20, unique=True)),
            ],
        ),
        migrations.RemoveField(
            model_name='course',
            name='season',
        ),
        migrations.AddField(
            model_name='course',
            name='seasons',
            field=models.ManyToManyField(related_name='courses', to='classes.season'),
        ),
    ]
