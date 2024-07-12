from django.db import models
from elective_field.models import ElectiveField
from season.models import Season


class Course(models.Model):
    major = models.CharField(max_length=50)
    abbreviation = models.CharField(max_length=10)
    class_number = models.CharField(max_length=10, default="XXXX")
    title = models.CharField(max_length=150, default="")
    prereqs = models.ManyToManyField('self', symmetrical=False, related_name='prerequisite_for', blank=True)
    seasons = models.ManyToManyField(Season)
    coreqs = models.ManyToManyField('self', symmetrical=False, related_name='corequisite_for', blank=True)
    description = models.TextField()
    credits = models.IntegerField(default=0)
    editable_credits = models.BooleanField(default=False)
    elective_field = models.ForeignKey(ElectiveField, on_delete=models.PROTECT, related_name='courses')

    def __str__(self):
        return f"Class: {self.abbreviation}"
