from rest_framework.serializers import ModelSerializer
from .models import Requirement


class RequirementSerializer(ModelSerializer):
    class Meta:
        model = Requirement
        fields = '__all__'
        extra_kwargs = {
            'attribute': {'required': False},
            'attribute_value': {'required': False},
            'attribute_choice': {'required': False},
        }
