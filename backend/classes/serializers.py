from rest_framework.serializers import ModelSerializer
from .models import Class


class ClassSerializer(ModelSerializer):
    class Meta:
        model = Class
        fields = ("major", "abbreviation", "prereq", "term", "coreq",
                  "description", "credits", "editable_credits",
                  "elective_field", "elective_field_name")
