# Generated by Django 4.2.6 on 2024-11-05 22:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('requirement', '0003_requirement_attribute_max_requirement_attribute_min_and_more'),
        ('template', '0007_template_requirement_attribute_count_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='template',
            name='requirement_attribute_count',
        ),
        migrations.RemoveField(
            model_name='template',
            name='requirement_attribute_size',
        ),
        migrations.RemoveField(
            model_name='template',
            name='requirement_attribute_size_type',
        ),
        migrations.RemoveField(
            model_name='template',
            name='requirement_class_attributes',
        ),
        migrations.AddField(
            model_name='template',
            name='requirements',
            field=models.ManyToManyField(to='requirement.requirement'),
        ),
    ]
