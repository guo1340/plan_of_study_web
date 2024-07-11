from django.db import models
from semester.models import Semester
from elective_field.models import ElectiveField


class Template(models.Model):
    min_credits = models.IntegerField(default=120)
    major = models.CharField(max_length=100, default="")
    elective_fields = models.ManyToManyField(ElectiveField)
    min_elective_fields = models.IntegerField(default=1)
    min_each_Elective = models.IntegerField(default=1)

    def __str__(self):
        return f"{self.major} requirements template"
