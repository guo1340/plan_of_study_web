# Generated by Django 4.2.6 on 2025-02-04 19:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('semester', '0006_alter_semester_classes'),
    ]

    operations = [
        migrations.AddField(
            model_name='semester',
            name='max_credit_each_semester',
            field=models.IntegerField(default=18),
        ),
        migrations.AddField(
            model_name='semester',
            name='min_credit_each_semester',
            field=models.IntegerField(default=12),
        ),
    ]
