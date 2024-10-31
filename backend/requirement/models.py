from django.db import models


# Create your models here.
class Requirement(models.Model):
    attribute = models.CharField(max_length=50, default="")
    requirement_type = models.CharField(max_length=20, default="credit")
    requirement_size = models.IntegerField(default=1)

    def __str__(self):
        rt = ""
        if self.requirement_type == "credit":
            rt = "credit "
        return (f"At least {self.requirement_size} {rt}of classes with {self.attribute} requirement(s)"
                f" needs to be fulfilled. ")
