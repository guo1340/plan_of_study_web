from django.db import models
from template.models import Template
from semester.models import Semester


class Plan(models.Model):
    credits = models.IntegerField(default=0)
    name = models.CharField(max_length=100, default="")
    template = models.ForeignKey(Template, on_delete=models.PROTECT)
    semesters = models.ManyToManyField(Semester, blank=True)

    # JSON field to store full course objects instead of just IDs
    course_cart = models.JSONField(default=list)

    requirement_filled = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.template.major} plan: {self.name}"
