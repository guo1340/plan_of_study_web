from rest_framework.serializers import ModelSerializer
from .models import Major


class MajorSerializer(ModelSerializer):
    class Meta:
        model = Major
        fields = '__all__'
