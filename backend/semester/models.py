import datetime
from django.db import models
from classes.models import Course


class Semester(models.Model):
    YEAR_CHOICES = [(r, r) for r in range(datetime.date.today().year, datetime.date.today().year + 10)]
    year = models.IntegerField(choices=YEAR_CHOICES, default=datetime.date.today().year)
    SEASON_CHOICES = [
        ('FALL', 'Fall'),
        ('SPRING', 'Spring'),
        ('SUMMER', 'Summer'),
        ('WINTER', 'Winter')
    ]
    season = models.CharField(max_length=20, choices=SEASON_CHOICES, default='FALL')
    classes = models.ManyToManyField(Course)
    current_credit = models.IntegerField(default=0)
    max_credits = models.IntegerField(default=40)
    min_credits = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.season} {self.year}"
