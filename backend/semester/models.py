import datetime
from django.db import models
from season.models import Season


class Semester(models.Model):
    YEAR_CHOICES = [(r, r) for r in range(datetime.date.today().year, datetime.date.today().year + 10)]
    year = models.IntegerField(choices=YEAR_CHOICES, default=datetime.date.today().year)
    season = models.ForeignKey(Season, on_delete=models.PROTECT, default=1)

    # JSON field to store full course objects instead of ManyToManyField
    classes = models.JSONField(default=list)

    current_credit = models.IntegerField(default=0)
    max_credits = models.IntegerField(default=40)
    min_credits = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.season} {self.year}"
