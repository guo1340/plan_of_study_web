from django.db import models
from semester.models import Semester
from elective_field.models import ElectiveField


class Template(models.Model):
    min_credits = models.IntegerField(default=120)
    requirements = models.JSONField(default=list)
    major = models.CharField(max_length=100, default="")
    semesters = models.ManyToManyField(Semester)
    elective_fields = models.ManyToManyField(ElectiveField)

    def __str__(self):
        return f"{self.major} requirements template"
