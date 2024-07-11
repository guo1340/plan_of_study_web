from rest_framework.serializers import ModelSerializer
from .models import Course


class ClassSerializer(ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'
