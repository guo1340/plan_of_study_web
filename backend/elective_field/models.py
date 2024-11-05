from django.db import models
from major.models import Major


class ElectiveField(models.Model):
    type_name = models.CharField(max_length=20, default="Area")
    major = models.ForeignKey(Major, on_delete=models.PROTECT, related_name="elective_fields", default=6)
    field_name = models.CharField(max_length=100, default="NONE")
    field_number = models.IntegerField(default=-1)

    def __str__(self):
        return f"{self.major.name} {self.type_name} {self.field_number}: {self.field_name}"
