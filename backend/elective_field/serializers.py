from rest_framework.serializers import ModelSerializer
from .models import ElectiveField


class ElectiveFieldSerializer(ModelSerializer):
    class Meta:
        model = ElectiveField
        fields = '__all__'
