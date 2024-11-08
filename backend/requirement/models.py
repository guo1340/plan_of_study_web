from django.db import models
from major.models import Major
from credit_type.models import CreditType


class Requirement(models.Model):
    # Define choices for requirement_type
    COMPARISON_CHOICES = [
        ('==', 'Exactly'),
        ('>=', 'At least'),
        ('<=', 'At most'),
        ('>', 'More than'),
        ('<', 'Less than')
    ]

    attribute = models.CharField(max_length=50, default="")
    attribute_value = models.IntegerField(default=-1)
    attribute_choice = models.CharField(max_length=2, choices=COMPARISON_CHOICES, default="==")
    major = models.ForeignKey(Major, on_delete=models.PROTECT, related_name="requirements", default=1)
    requirement_size = models.IntegerField(default=1)
    requirement_type = models.CharField(max_length=2, choices=COMPARISON_CHOICES, default="==")
    credit_type = models.ForeignKey(CreditType, on_delete=models.PROTECT, related_name="requirements", default=2)

    def __str__(self):
        # Create a dictionary to map requirement_type to its label
        comparison_labels = dict(self.COMPARISON_CHOICES)

        # Get the human-readable label for the current requirement_type
        prefix = comparison_labels.get(self.requirement_type)

        comp = comparison_labels.get(self.attribute_choice)

        # Build the return string
        return (
            f"{prefix} {self.requirement_size} credits of classes with {self.attribute} being {comp} {self.attribute_value} "
            f"need to be fulfilled.")
