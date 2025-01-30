from django.db import models
from elective_field.models import ElectiveField
from season.models import Season
from credit_type.models import CreditType
from major.models import Major


class Course(models.Model):
    major = models.ForeignKey(Major, on_delete=models.PROTECT, related_name="courses", default=1)
    class_number = models.IntegerField(default="4000")
    title = models.CharField(max_length=150, default="")
    prereqs = models.ManyToManyField('self', symmetrical=False, related_name='prerequisite_for', blank=True)
    seasons = models.ManyToManyField(Season)
    coreqs = models.ManyToManyField('self', symmetrical=False, related_name='corequisite_for', blank=True)
    description = models.TextField()
    credits = models.IntegerField(default=0)
    editable_credits = models.BooleanField(default=False)
    elective_field = models.ForeignKey(ElectiveField, on_delete=models.PROTECT, related_name='courses')
    credit_type = models.ForeignKey(CreditType, on_delete=models.PROTECT, related_name="courses", default=1)
    link = models.TextField(default="https://cs.vt.edu/Graduate/Courses.html")

    def __str__(self):
        return f"Class: {self.abbreviation} {self.class_number}"
