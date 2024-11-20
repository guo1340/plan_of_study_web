import json

from rest_framework.viewsets import ModelViewSet
from .models import Template
from .serializers import TemplateSerializer
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny


class TemplateViewSet(ModelViewSet):
    queryset = Template.objects.all()
    serializer_class = TemplateSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            # Allow unauthenticated access to GET requests
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

        # Start with all templates
        queryset = Template.objects.all()
        print(f"Initial queryset count: {queryset.count()}")
        major = search_data.get("major", None)
        if major:
            queryset = queryset.filter(major__exact=major)
            print(f"Filtered by major, queryset count: {queryset.count()}")

        level = search_data.get("level", None)
        if level:
            queryset = queryset.filter(level__iexact=level)
            print(f"Filtered by level, queryset count: {queryset.count()}")

        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        major = request.data.get('major')
        level = request.data.get('level')
        if Template.objects.filter(major=major, level=level).exists():
            return Response({"error": "A Template with this major and level already exists."}, status=400)
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=400)

    def retrieve(self, request, pk=None, *args, **kwargs):
        template_obj = Template.objects.all().get(pk=pk)
        serializer = self.serializer_class(template_obj)
        return Response(serializer.data)

    def update(self, request, pk=None, *args, **kwargs):
        template_obj = Template.objects.all().get(pk=pk)
        major = request.data.get('major')
        level = request.data.get('level')
        if Template.objects.filter(major=major, level=level).exclude(pk=pk).exists():
            return Response({"error": "A template with this major already exists."}, status=400)
        serializer = self.serializer_class(template_obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=400)

    def destroy(self, request, pk=None, *args, **kwargs):
        template_obj = Template.objects.all().get(pk=pk)
        template_obj.delete()
        return Response(status=204)
