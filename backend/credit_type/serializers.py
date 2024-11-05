from rest_framework.serializers import ModelSerializer
from .models import CreditType


class CreditTypeSerializer(ModelSerializer):
    class Meta:
        model = CreditType
        fields = '__all__'
