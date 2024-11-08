from django.db import models
from semester.models import Semester
from elective_field.models import ElectiveField
from requirement.models import Requirement
from major.models import Major


class Template(models.Model):
    min_credits = models.IntegerField(default=120)
    major = models.ForeignKey(Major, on_delete=models.PROTECT, related_name="templates", default=6)
    level = models.CharField(max_length=100, default="")
    elective_fields = models.ManyToManyField(ElectiveField)
    min_elective_fields = models.IntegerField(default=1)
    min_each_Elective = models.IntegerField(default=1)
    requirements = models.ManyToManyField(Requirement)

    def __str__(self):
        return f"{self.major} requirements template"
