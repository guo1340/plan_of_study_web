# Generated by Django 4.2.6 on 2024-10-25 21:06

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('template', '0006_template_abbreviation'),
    ]

    operations = [
        migrations.AddField(
            model_name='template',
            name='requirement_attribute_count',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.IntegerField(default=1), blank=True, default=list, size=None),
        ),
        migrations.AddField(
            model_name='template',
            name='requirement_attribute_size',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.IntegerField(default=1), blank=True, default=list, size=None),
        ),
        migrations.AddField(
            model_name='template',
            name='requirement_attribute_size_type',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.CharField(default='', max_length=100), blank=True, default=list, size=None),
        ),
        migrations.AddField(
            model_name='template',
            name='requirement_class_attributes',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.CharField(max_length=100), blank=True, default=list, size=None),
        ),
    ]
