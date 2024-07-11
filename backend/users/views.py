from rest_framework.viewsets import ModelViewSet
from .models import Details
from .serializers import UserSerializer
from rest_framework.response import Response
from rest_framework import status


class UserViewSet(ModelViewSet):
    queryset = Details.objects.all()
    serializer_class = UserSerializer

    def list(self, request):
        queryset = self.get_queryset()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk=None):
        user_obj = self.get_object()
        serializer = self.serializer_class(user_obj)
        return Response(serializer.data)

    def update(self, request, pk=None):
        user_obj = self.get_object()
        serializer = self.serializer_class(user_obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        user_obj = self.get_object()
        user_obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
