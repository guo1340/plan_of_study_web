from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Details, Plan


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'password', 'email')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

    def update(self, instance, validated_data):
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        password = validated_data.get('password', None)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class DetailsSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Details
        fields = '__all__'
        read_only_fields = ['user']

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        plans_data = validated_data.pop('plans', [])
        user = UserSerializer.create(UserSerializer(), validated_data=user_data)
        details = Details.objects.create(user=user, **validated_data)
        if plans_data:
            details.plans.set(plans_data)
        return details

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', None)
        plans_data = validated_data.pop('plans', None)

        if user_data:
            user = instance.user
            UserSerializer().update(user, user_data)

        if 'role' in validated_data:
            instance.role = validated_data['role']

        if plans_data is not None:
            instance.plans.set(plans_data)

        instance.save()
        return instance
