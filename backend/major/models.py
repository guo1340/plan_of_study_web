from django.db import models


class Major(models.Model):
    name = models.CharField(max_length=100, default="")
    abbreviation =\
        models.CharField(max_length=10, default="")

    def __str__(self):
        return f"{self.abbreviation}':' {self.name}"
