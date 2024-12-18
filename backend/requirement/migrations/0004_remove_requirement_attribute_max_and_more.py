# Generated by Django 4.2.6 on 2024-11-08 20:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('requirement', '0003_requirement_attribute_max_requirement_attribute_min_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='requirement',
            name='attribute_max',
        ),
        migrations.RemoveField(
            model_name='requirement',
            name='attribute_min',
        ),
        migrations.AddField(
            model_name='requirement',
            name='attribute_choice',
            field=models.CharField(choices=[('==', 'Exactly'), ('>=', 'At least'), ('<=', 'At most'), ('>', 'More than'), ('<', 'Less than')], default='==', max_length=2),
        ),
    ]
