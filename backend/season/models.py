from django.db import models


class Season(models.Model):
    SEASON_CHOICES = [
        ('FALL', 'Fall'),
        ('SPRING', 'Spring'),
        ('SUMMER', 'Summer'),
        ('WINTER', 'Winter')
    ]
    name = models.CharField(max_length=20, choices=SEASON_CHOICES, default='FALL')

    def __str__(self):
        return f"{self.name} Season"
