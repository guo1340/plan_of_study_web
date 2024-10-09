from rest_framework.viewsets import ModelViewSet
from .models import ElectiveField
from .serializers import ElectiveFieldSerializer
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny


class ElectiveFieldViewSet(ModelViewSet):
    queryset = ElectiveField.objects.all()
    serializer_class = ElectiveFieldSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'list_by_major', 'list_major']:
            # Allow unauthenticated access to GET requests
            permission_classes = [AllowAny]
        else:
            # Require authentication for non-GET requests (POST, PUT, DELETE, etc.)
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def list(self, request):
        queryset = ElectiveField.objects.all()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    def create(self, request):
        major = request.data.get('major')
        field_name = request.data.get('field_name')
        field_number = request.data.get('field_number')
        if ElectiveField.objects.filter(major=major, field_name=field_name).exists():
            return Response({"error": "An elective field with this major and field name already exists."}, status=400)
        if ElectiveField.objects.filter(major=major, field_number=field_number).exists():
            return Response({"error": "An elective field with this major and field number already exists."}, status=400)
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
        major = request.data.get('major')
        field_name = request.data.get('field_name')
        field_number = request.data.get('field_number')
        if ElectiveField.objects.filter(major=major, field_name=field_name).exclude(pk=pk).exists():
            return Response({"error": "An elective field with this major and field name already exists."}, status=400)
        if ElectiveField.objects.filter(major=major, field_number=field_number).exclude(pk=pk).exists():
            return Response({"error": "An elective field with this major and field number already exists."}, status=400)

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

    @action(detail=False, methods=['get'], url_path='major/(?P<major>[^/.]+)')
    def list_by_major(self, request, major=None):
        queryset = ElectiveField.objects.filter(major=major)
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='majors')
    def list_majors(self, request):
        majors = ElectiveField.objects.values_list('major', flat=True).distinct()
        return Response(list(majors))