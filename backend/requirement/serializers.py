from rest_framework.serializers import ModelSerializer
from .models import Requirement

class RequirememtSerializer(ModelSerializer):
    class Meta:
        model = Requirement
        fields = '__all__'