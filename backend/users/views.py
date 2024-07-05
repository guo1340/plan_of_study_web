from rest_framework.viewsets import ModelViewSet
from .models import Details
from .serializers import UserSerializer
from rest_framework.response import Response


class UserViewSet(ModelViewSet):
    queryset = Details.objects.all()
    serializer_class = UserSerializer

    def list(self, request):
        queryset = Semester.objects.all()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=400)

    def retrieve(self, request, pk=None):
        user_obj = Details.objects.all().get(pk=pk)
        serializer = self.serializer_class(user_obj)
        return Response(serializer.data)

    def update(self, request, pk=None):
        user_obj = Details.objects.all().get(pk=pk)
        serializer = self.serializer_class(user_obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=400)

    def destroy(self, request, pk=None):
        user_obj = Details.objects.all().get(pk=pk)
        user_obj.delete()
        return Response(status=204)
