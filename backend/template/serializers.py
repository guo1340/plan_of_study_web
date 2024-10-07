from rest_framework.serializers import ModelSerializer
from .models import Template


class TemplateSerializer(ModelSerializer):
    class Meta:
        model = Template
        fields = '__all__'
        extra_kwargs = {
            'elective_fields': {'required': False}  # Marking it as optional
        }

    def validate_elective_fields(self, value):
        # Allow an empty list for elective_fields
        if value == []:
            return value
        return value