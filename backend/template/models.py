from django.db import models
from semester.models import Semester
from elective_field.models import ElectiveField
from django.contrib.postgres.fields import ArrayField
from requirement.models import Requirement
from major.models import Major


class Template(models.Model):
    min_credits = models.IntegerField(default=120)
    major = models.ForeignKey(Major, on_delete=models.PROTECT, related_name="templates", default=6)
    level = models.CharField(max_length=100, default="")
    abbreviation = models.CharField(max_length=100, default="")
    elective_fields = models.ManyToManyField(ElectiveField)
    min_elective_fields = models.IntegerField(default=1)
    min_each_Elective = models.IntegerField(default=1)
    requirements = models.ManyToManyField(Requirement)
    # # elective field would be an example of this attribute
    # requirement_class_attributes = ArrayField(
    #     models.CharField(max_length=100), blank=True, default=list
    # )
    # # Requirement_attribute_count is the number of this attribute that needs to be fulfilled.
    # # For example, if the requirement is elective field, then this would be how many elective fields needs
    # # to be satisfied. This normally would be 1 considering normally there are not a lot of
    # # requirements are lists.
    # requirement_attribute_count = ArrayField(
    #     models.IntegerField(default=1), blank=True, default=list)
    # # requirement_attribute_size_type represents if this requirement is being counted by credits
    # # or by number of classes, so it should only be either "class" or "credit" in the list
    # requirement_attribute_size_type = ArrayField(
    #     models.CharField(max_length=100, default=""), blank=True, default=list)
    # # requirement_attribute_size represents how many classes or credits the classes with this attribute
    # # should have in a plan
    # requirement_attribute_size = ArrayField(
    #     models.IntegerField(default=1), blank=True, default=list)

    def __str__(self):
        return f"{self.major} requirements template"
