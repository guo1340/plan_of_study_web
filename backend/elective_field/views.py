import json

from rest_framework.viewsets import ModelViewSet
from .models import ElectiveField
from .serializers import ElectiveFieldSerializer
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from major.models import Major


class ElectiveFieldViewSet(ModelViewSet):
    queryset = ElectiveField.objects.all()
    serializer_class = ElectiveFieldSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            # Allow unauthenticated access to GET requests
            if self.action == 'search' and self.request.method == 'POST':
                permission_classes = [AllowAny]
            else:
                # Allow unauthenticated access to GET requests for all listed actions
                permission_classes = [AllowAny]
        else:
            # Require authentication for non-GET requests (POST, PUT, DELETE, etc.)
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def list(self, request, *args, **kwargs):
        # Get the 'search' parameter from the query string
        search_param = request.query_params.get('search', None)

        if search_param:
            try:
                # Parse the JSON from the query string
                search_data = json.loads(search_param)
            except json.JSONDecodeError:
                return Response({"error": "Invalid JSON format"}, status=400)
        else:
            search_data = {}

        # Log the parsed search data for debugging purposes
        print(f"Search data received: {search_data}")
        queryset = ElectiveField.objects.all()
        print(f"Initial queryset count: {queryset.count()}")

        major = search_data.get("major", None)
        if major:
            queryset = queryset.filter(major__exact=major)
            print(f"Filtered by major, queryset count: {queryset.count()}")

        field_name = search_data.get("field_name", None)
        if field_name:
            queryset = queryset.filter(field_name__iexact=field_name)
            print(f"Filtered by field_name, queryset count: {queryset.count()}")
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        major_id = request.data.get('major')
        field_name = request.data.get('field_name')
        field_number = request.data.get('field_number')
        try:
            major = Major.objects.get(pk=major_id)
        except Major.DoesNotExist:
            return Response({"error": "The specified major does not exist."}, status=400)
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

    def retrieve(self, request, pk=None, *args, **kwargs):
        elective_field_obj = ElectiveField.objects.all().get(pk=pk)
        serializer = self.serializer_class(elective_field_obj)
        return Response(serializer.data)

    def update(self, request, pk=None, *args, **kwargs):
        elective_field_obj = ElectiveField.objects.all().get(pk=pk)
        major_id = request.data.get('major')
        field_name = request.data.get('field_name')
        field_number = request.data.get('field_number')
        try:
            major = Major.objects.get(pk=major_id)
        except Major.DoesNotExist:
            return Response({"error": "The specified major does not exist."}, status=400)

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

    def destroy(self, request, pk=None, *args, **kwargs):
        elective_field_obj = ElectiveField.objects.all().get(pk=pk)
        elective_field_obj.delete()
        return Response(status=204)

    @action(detail=False, methods=['get'], url_path='major/(?P<major>[^/.]+)')
    def list_by_major(self, request, major_id=None):
        queryset = ElectiveField.objects.filter(major__pk=major_id)
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='majors')
    def list_majors(self, request):
        majors = ElectiveField.objects.values_list('major', flat=True).distinct()
        return Response(list(majors))
