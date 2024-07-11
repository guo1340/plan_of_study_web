from django.db import models


class ElectiveField(models.Model):
    type_name = models.CharField(default="Area")
    major = models.TextField(default="")
    field_name = models.CharField(default="test")
    field_number = models.IntegerField(default=-1)

    def __str__(self):
        return f"{self.major} {self.type_name} {self.field_number}: {self.field_name}"
