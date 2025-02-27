import json
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from .models import Major
from .serializers import MajorSerializer
from rest_framework.exceptions import PermissionDenied
from django.db.models import Q
from rest_framework.response import Response


def check_admin_permission(request):
    # Ensure the user is authenticated
    if not request.user.is_authenticated:
        raise PermissionDenied("You must be logged in to perform this action.")

    # Check if the user has a 'details' object and if their role is 'admin'
    if not hasattr(request.user, 'details') or request.user.details.role != 'admin':
        raise PermissionDenied("You do not have permission to perform this action.")


class MajorViewSet(ModelViewSet):
    queryset = Major.objects.all()
    serializer_class = MajorSerializer

    def get_permissions(self):
        # Allow unauthenticated access to certain actions
        if self.action in ['list', 'retrieve']:

            # Allow unauthenticated access to both GET and POST requests for the 'search' action
            if self.action == 'search' and self.request.method == 'POST':
                permission_classes = [AllowAny]
            else:
                # Allow unauthenticated access to GET requests for all listed actions
                permission_classes = [AllowAny]
        else:
            # Require authentication for all other actions
            permission_classes = [IsAuthenticated]

        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        check_admin_permission(request)
        name = request.data.get("name")
        abbreviation = request.data.get("abbreviation")
        if Major.objects.filter(Q(name=name) & Q(abbreviation=abbreviation)).exists():
            return Response({"error": "A major with the same name or abbreviation already exists"}, status=400)

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=400)

    def update(self, request, pk=None, *args, **kwargs):
        check_admin_permission(request)  # Ensure user has admin role
        name = request.data.get("name")
        abbreviation = request.data.get("abbreviation")
        if (Major.objects.filter(Q(name=name) & Q(abbreviation=abbreviation))
                .exclude(pk=pk).exists()):
            return Response({"error": "A class with the same major, class number, and title already exists."},
                            status=400)
        major_obj = Major.objects.all().get(pk=pk)
        serializer = self.serializer_class(major_obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=400)

    def destroy(self, request, pk=None, *args, **kwargs):
        check_admin_permission(request)  # Ensure user has admin role
        major_obj = Major.objects.all().get(pk=pk)
        major_obj.delete()
        return Response(status=204)

    # /api/major/?search={"name": "Computer Science"}
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

        # Start with all majors
        queryset = Major.objects.all()
        print(f"Initial queryset count: {queryset.count()}")

        name = search_data.get("name", None)
        if name:
            queryset = queryset.filter(name__iexact=name)
            print(f"Filtered by name, queryset count: {queryset.count()}")

        abbreviation = search_data.get("abbreviation", None)
        if abbreviation:
            queryset = queryset.filter(abbreviation__iexact=abbreviation)
            print(f"Filtered by abbreviation, queryset count: {queryset.count()}")

        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)
