from django.db import models


class Course(models.Model):
    major = models.CharField(max_length=50)
    abbreviation = models.CharField(max_length=10)
    title = models.CharField(max_length=150, default="")
    prereqs = models.ManyToManyField('self', symmetrical=False, related_name='prerequisite_for', blank=True)
    term = models.CharField(max_length=50)
    coreqs = models.ManyToManyField('self', symmetrical=False, related_name='corequisite_for', blank=True)
    description = models.TextField()
    credits = models.IntegerField(default=0)
    editable_credits = models.BooleanField(default=False)
    elective_field = models.IntegerField(default=-1)
    elective_field_name = models.CharField(max_length=50)

    def __str__(self):
        return f"Class: {self.abbreviation}"
