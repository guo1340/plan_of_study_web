# Generated by Django 4.2.6 on 2024-07-16 19:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('plan', '0001_initial'),
        ('users', '0002_details_plans'),
    ]

    operations = [
        migrations.AlterField(
            model_name='details',
            name='plans',
            field=models.ManyToManyField(blank=True, to='plan.plan'),
        ),
    ]
