# Generated by Django 4.2.6 on 2024-07-16 20:32

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('template', '0005_remove_template_requirements_and_more'),
        ('plan', '0002_alter_plan_semesters'),
    ]

    operations = [
        migrations.AlterField(
            model_name='plan',
            name='template',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='template.template'),
        ),
    ]
