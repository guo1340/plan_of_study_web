from django.db import models
from template.models import Template
from semester.models import Semester
from classes.models import Course


class Plan(models.Model):
    credits = models.IntegerField(default=0)
    name = models.CharField(max_length=100, default="")
    template = models.ForeignKey(Template, on_delete=models.PROTECT)
    semesters = models.ManyToManyField(Semester, blank=True)
    course_cart = models.ManyToManyField(Course, blank=True)
    requirement_filled = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.template.major} plan: {self.name}"
