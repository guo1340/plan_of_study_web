from rest_framework.viewsets import ModelViewSet
from .models import ElectiveField
from .serializers import ElectiveFieldSerializer
from rest_framework.response import Response


class ElectiveFieldViewSet(ModelViewSet):
    queryset = ElectiveField.objects.all()
    serializer_class = ElectiveFieldSerializer

    def list(self, request):
        queryset = ElectiveField.objects.all()
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
        elective_field_obj = ElectiveField.objects.all().get(pk=pk)
        serializer = self.serializer_class(elective_field_obj)
        return Response(serializer.data)

    def update(self, request, pk=None):
        elective_field_obj = ElectiveField.objects.all().get(pk=pk)
        serializer = self.serializer_class(elective_field_obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=400)

    def destroy(self, request, pk=None):
        elective_field_obj = ElectiveField.objects.all().get(pk=pk)
        elective_field_obj.delete()
        return Response(status=204)
