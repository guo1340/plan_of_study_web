from django.db import models
from major.models import Major


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
    attribute_min = models.IntegerField(default=-1)
    attribute_max = models.IntegerField(default=-1)
    major = models.ForeignKey(Major, on_delete=models.PROTECT, related_name="requirements", default=1)
    requirement_size = models.IntegerField(default=1)
    requirement_type = models.CharField(max_length=2, choices=COMPARISON_CHOICES, default="==")

    def __str__(self):
        # Create a dictionary to map requirement_type to its label
        comparison_labels = dict(self.COMPARISON_CHOICES)

        # Get the human-readable label for the current requirement_type
        prefix = comparison_labels.get(self.requirement_type)

        att_min = ""
        equ = ""
        att_max = ""
        if self.attribute_value != -1:
            equ = f" {self.attribute_value}"
        if self.attribute_min != -1:
            att_min = f" at least {self.attribute_min}"
        if self.attribute_max != -1:
            att_max = f" at most {self.attribute_max}"

            # Build the return string
        return (f"{prefix} {self.requirement_size} of classes with {self.attribute} being{equ}{att_max}{att_min} "
                f"need to be fulfilled.")
