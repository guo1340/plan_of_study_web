from rest_framework.viewsets import ModelViewSet
from .models import Semester
from .serializers import SemesterSerializer
from rest_framework.response import Response


class SemesterViewSet(ModelViewSet):
    queryset = Semester.objects.all()
    serializer_class = SemesterSerializer

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
        semester_obj = Semester.objects.all().get(pk=pk)
        serializer = self.serializer_class(semester_obj)
        return Response(serializer.data)

    def update(self, request, pk=None):
        semester_obj = Semester.objects.all().get(pk=pk)
        serializer = self.serializer_class(semester_obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=400)

    def destroy(self, request, pk=None):
        semester_obj = Semester.objects.all().get(pk=pk)
        semester_obj.delete()
        return Response(status=204)
