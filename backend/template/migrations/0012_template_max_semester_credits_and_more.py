# Generated by Django 4.2.6 on 2025-01-31 19:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('template', '0011_remove_template_elective_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='template',
            name='max_semester_credits',
            field=models.IntegerField(default=18),
        ),
        migrations.AddField(
            model_name='template',
            name='min_semester_credits',
            field=models.IntegerField(default=0),
        ),
    ]
