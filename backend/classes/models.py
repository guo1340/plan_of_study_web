from django.db import models


class Class(models.Model):
    major = models.CharField(max_length=50)
    abbreviation = models.CharField(max_length=150)
    prereq = models.CharField(max_length=50)
    term = models.CharField(max_length=50)
    coreq = models.CharField(max_length=50)
    description = models.TextField()
    credits = models.IntegerField(default=0)
    editable_credits = models.BooleanField(default=False)
    elective_field = models.JSONField(default=list)
    elective_field_name = models.CharField(max_length=50)

    def __str__(self):
        return f"Class: {self.abbreviation}"
