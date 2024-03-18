from django.db import models


class Class(models.Model):
    major = models.CharField(max_length=50)
    abbreviation = models.CharField(max_length=10)
    title = models.CharField(max_length=150, default="")
    prereq = models.CharField(max_length=10)
    term = models.CharField(max_length=50)
    coreq = models.CharField(max_length=10)
    description = models.TextField()
    credits = models.IntegerField(default=0)
    editable_credits = models.BooleanField(default=False)
    elective_field = models.IntegerField(default=-1)
    elective_field_name = models.CharField(max_length=50)

    def __str__(self):
        return f"Class: {self.abbreviation}"
