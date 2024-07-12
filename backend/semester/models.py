import datetime
from django.db import models
from classes.models import Course
from season.models import Season


class Semester(models.Model):
    YEAR_CHOICES = [(r, r) for r in range(datetime.date.today().year, datetime.date.today().year + 10)]
    year = models.IntegerField(choices=YEAR_CHOICES, default=datetime.date.today().year)
    season = models.ManyToManyField(Season)
    classes = models.ManyToManyField(Course)
    current_credit = models.IntegerField(default=0)
    max_credits = models.IntegerField(default=40)
    min_credits = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.season} {self.year}"
