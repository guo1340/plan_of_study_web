from rest_framework.serializers import ModelSerializer
from .models import Course


class ClassSerializer(ModelSerializer):
    class Meta:
        model = Course
        # fields = ("major", "abbreviation", "prereq", "term", "coreq",
        #           "description", "credits", "editable_credits",
        #           "elective_field", "elective_field_name")
        fields = '__all__'
