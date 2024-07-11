# Generated by Django 4.2.6 on 2024-07-08 20:47

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('elective_field', '0001_initial'),
        ('classes', '0008_rename_prereq_course_prereqs_remove_course_coreq_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='course',
            name='elective_field_name',
        ),
        migrations.AlterField(
            model_name='course',
            name='elective_field',
            field=models.OneToOneField(on_delete=django.db.models.deletion.PROTECT, to='elective_field.electivefield'),
        ),
    ]