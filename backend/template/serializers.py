from rest_framework import serializers

from requirement.models import Requirement
from .models import Template
from elective_field.models import ElectiveField


def validate_elective_fields(value):
    # Allow an empty list for elective_fields
    if value == []:
        return value
    return value


def validate_requirement(value):
    # Allow an empty list for elective_fields
    if value == []:
        return value
    return value


class TemplateSerializer(serializers.ModelSerializer):
    elective_fields = serializers.PrimaryKeyRelatedField(
        queryset=ElectiveField.objects.all(),
        many=True,
        required=False,  # This allows the field to be optional
        allow_empty=True  # This explicitly allows an empty list
    )

    requirements = serializers.PrimaryKeyRelatedField(
        queryset=Requirement.objects.all(),
        many=True,
        required=False,  # This allows the field to be optional
        allow_empty=True  # This explicitly allows an empty list
    )

    class Meta:
        model = Template
        fields = '__all__'
