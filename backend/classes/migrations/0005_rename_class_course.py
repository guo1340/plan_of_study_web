# Generated by Django 4.2.6 on 2024-03-25 16:19

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('classes', '0004_alter_class_abbreviation_alter_class_coreq_and_more'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='Class',
            new_name='Course',
        ),
    ]
