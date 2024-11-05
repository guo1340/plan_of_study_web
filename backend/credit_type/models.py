from django.db import models
from major.models import Major


# Create your models here.
class CreditType(models.Model):
    major = models.ForeignKey(Major, on_delete=models.PROTECT, related_name="credit_type")
    number = models.IntegerField(default=-1)
    name = models.CharField(max_length=100, default="")

    def __str__(self):
        return f"Credit type {self.number}: {self.name} in major {self.major}"
