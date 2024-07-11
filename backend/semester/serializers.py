from rest_framework.serializers import ModelSerializer
from .models import Semester


class SemesterSerializer(ModelSerializer):
    class Meta:
        model = Semester
        fields = '__all__'
