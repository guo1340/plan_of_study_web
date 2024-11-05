import json

from django.db.models import Q
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from .models import CreditType
from .serializers import CreditTypeSerializer


def check_admin_permission(request):
    # Ensure the user is authenticated
    if not request.user.is_authenticated:
        raise PermissionDenied("You must be logged in to perform this action.")

    # Check if the user has a 'details' object and if their role is 'admin'
    if not hasattr(request.user, 'details') or request.user.details.role != 'admin':
        raise PermissionDenied("You do not have permission to perform this action.")


class CreditTypeViewSet(ModelViewSet):
    queryset = CreditType.objects.all()
    serializer_class = CreditTypeSerializer

    def get_permissions(self):
        # Allow unauthenticated access to 'list' and 'retrieve' actions
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            # Require authentication for all other actions
            permission_classes = [IsAuthenticated]

        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        check_admin_permission(request)
        major = request.data.get("major")
        number = request.data.get("number")
        name = request.data.get("name")
        if CreditType.objects.filter(Q(major=major) & Q(number=number)).exists():
            return Response({"error": "A Credit type with the same major and type number already exists."},
                            status=400)
        elif CreditType.objects.filter(Q(major=major) & Q(name=name)).exists():
            return Response({"error": "A Credit type with the same major and type name already exists."},
                            status=400)
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=400)

    def update(self, request, pk=None, *args, **kwargs):
        check_admin_permission(request)
        major = request.data.get("major")
        number = request.data.get("number")
        name = request.data.get("name")
        if CreditType.objects.filter(Q(major=major) & Q(number=number)).exclude(pk=pk).exists():
            return Response({"error": "A Credit type with the same major and type number already exists."},
                            status=400)
        elif CreditType.objects.filter(Q(major=major) & Q(name=name)).exclude(pk=pk).exists():
            return Response({"error": "A Credit type with the same major and type name already exists."},
                            status=400)
        credit_type_obj = CreditType.objects.all().get(pk=pk)
        serializer = self.serializer_class(credit_type_obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=400)

    def destroy(self, request, pk=None, *args, **kwargs):
        check_admin_permission(request)  # Ensure user has admin role
        credit_type_obj = CreditType.objects.all().get(pk=pk)
        credit_type_obj.delete()
        return Response(status=204)

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

        # Start with all courses
        queryset = CreditType.objects.all()
        print(f"Initial queryset count: {queryset.count()}")

        # 1. Filter by major (exact match, case-insensitive)
        major = search_data.get('major', None)
        if major:
            queryset = queryset.filter(major__iexact=major)
            print(f"Filtered by major, queryset count: {queryset.count()}")
        # 2. Filter by number (exact match, case-insensitive)
        number = search_data.get('number', None)
        if number:
            queryset = queryset.filter(number__iexact=number)
            print(f"Filtered by number, queryset count: {queryset.count()}")
        # 3. Filter by name (exact match, case-insensitive)
        name = search_data.get('name', None)
        if name:
            queryset = queryset.filter(name__iexact=name)
            print(f"Filtered by name, queryset count: {queryset.count()}")

        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)
