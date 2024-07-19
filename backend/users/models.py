from django.db import models
from django.contrib.auth.models import User
from plan.models import Plan

class Details(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(default="regular", max_length=50)
    plans = models.ManyToManyField(Plan, blank=True)

    def __str__(self):
        return self.user.username
