import json

from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.viewsets import ModelViewSet
from .models import Requirement
from django.db.models import Q
from .serializers import RequirememtSerializer
from rest_framework.response import Response


# Create your views here.
def check_admin_permission(request):
    # Ensure the user is authenticated
    if not request.user.is_authenticated:
        raise PermissionDenied("You must be logged in to perform this action.")

    # Check if the user has a 'details' object and if their role is 'admin'
    if not hasattr(request.user, 'details') or request.user.details.role != 'admin':
        raise PermissionDenied("You do not have permission to perform this action.")


class RequirementViewSet(ModelViewSet):
    queryset = Requirement.objects.all()
    serializer_class = RequirememtSerializer

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
        attribute = request.data.get("attribute")
        attribute_value = request.data.get("attribute_value")
        attribute_choice = request.data.get("attribute_choice")
        major = request.data.get("major")
        requirement_size = request.data.get("requirement_size")
        requirement_type = request.data.get("requirement_type")
        credit_type = request.data.get("credit_type")
        if Requirement.objects.filter(
                Q(attribute=attribute) & Q(attribute_value=attribute_value) & Q(attribute_value=attribute_value) & Q(
                    attribute_choice=attribute_choice) & Q(
                    major=major) & Q(requirement_size=requirement_size) & Q(
                    requirement_type=requirement_type) & Q(credit_type=credit_type)).exists():
            return Response({"error": "A requirement with the same everything already exists"}, status=400)

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=400)

    def update(self, request, pk=None, *args, **kwargs):
        check_admin_permission(request)  # Ensure user has admin role
        attribute = request.data.get("attribute")
        attribute_value = request.data.get("attribute_value")
        attribute_choice = request.data.get("attribute_choice")
        major = request.data.get("major")
        requirement_size = request.data.get("requirement_size")
        requirement_type = request.data.get("requirement_type")
        credit_type = request.data.get("credit_type")
        if (Requirement.objects.filter(
                Q(attribute=attribute) & Q(attribute_value=attribute_value) & Q(attribute_value=attribute_value) & Q(
                    attribute_choice=attribute_choice) & Q(
                    major=major) & Q(requirement_size=requirement_size) & Q(
                    requirement_type=requirement_type) & Q(credit_type=credit_type))
                .exclude(pk=pk).exists()):
            return Response({"error": "An exact same requirement already exists."},
                            status=400)
        req_obj = Requirement.objects.all().get(pk=pk)
        serializer = self.serializer_class(req_obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=400)

    def destroy(self, request, pk=None, *args, **kwargs):
        check_admin_permission(request)  # Ensure user has admin role
        req_obj = Requirement.objects.all().get(pk=pk)
        req_obj.delete()
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

        queryset = Requirement.objects.all()
        print(f"Initial queryset count: {queryset.count()}")

        attribute = search_data.get("attribute", None)
        if attribute:
            queryset = queryset.filter(attribute__iexact=attribute)
            print(f"Filtered by attribute, queryset count: {queryset.count()}")

        major = search_data.get("major", None)
        if major:
            queryset = queryset.filter(major__iexact=major)
            print(f"Filtered by major, queryset count: {queryset.count()}")

        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)
