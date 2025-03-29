import json

from django.db.models import Q, Count
from rest_framework.viewsets import ModelViewSet
from .models import Course
from .serializers import ClassSerializer
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import PermissionDenied
from rest_framework import status


def check_admin_permission(request):
    # Ensure the user is authenticated
    if not request.user.is_authenticated:
        raise PermissionDenied("You must be logged in to perform this action.")

    # Check if the user has a 'details' object and if their role is 'admin'
    if not hasattr(request.user, 'details') or request.user.details.role != 'admin':
        raise PermissionDenied("You do not have permission to perform this action.")


class ClassViewSet(ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = ClassSerializer

    # Override get_permissions to set different permissions for different actions
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
        check_admin_permission(request)  # Ensure user has admin role
        major = request.data.get("major")
        class_number = request.data.get('class_number')
        title = request.data.get("title")
        if Course.objects.filter(Q(class_number=class_number) & Q(major=major)
                                 & Q(title=title)).exists():
            return Response({"error": "A class with the same major, class number, and title already exists."},
                            status=400)
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=400)

    def update(self, request, pk=None, *args, **kwargs):
        class_obj = Course.objects.get(pk=pk)

        # Extract fields from request
        course_id_list_update = "course_id_list" in request.data and len(request.data) == 1

        # Only check admin permissions if the update does NOT solely involve course_id_list
        if not course_id_list_update:
            check_admin_permission(request)  # Ensure user has admin role

            major = request.data.get("major")
            class_number = request.data.get('class_number')
            title = request.data.get("title")

            # Check if a duplicate course exists with the same major, class number, and title
            if Course.objects.filter(Q(class_number=class_number) & Q(major=major) & Q(title=title)).exclude(
                    pk=pk).exists():
                return Response({"error": "A class with the same major, class number, and title already exists."},
                                status=status.HTTP_400_BAD_REQUEST)

        # Proceed with updating the course
        serializer = self.serializer_class(class_obj, data=request.data, partial=True)  # Allow partial updates
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None, *args, **kwargs):
        check_admin_permission(request)  # Ensure user has admin role
        class_obj = Course.objects.all().get(pk=pk)
        class_obj.delete()
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
        queryset = Course.objects.all()
        print(f"Initial queryset count: {queryset.count()}")

        # 1. Filter by major (exact match, case-insensitive)
        major = search_data.get('major', None)
        if major:
            queryset = queryset.filter(major__exact=major)
            print(f"Filtered by major, queryset count: {queryset.count()}")
        # 2. Filter by credit_type (exact match, case-insensitive)
        credit_type = search_data.get('credit_type', None)
        if credit_type:
            queryset = queryset.filter(credit_type__exact=credit_type)
            print(f"Filtered by credit_type, queryset count: {queryset.count()}")

        # 3. Filter by class number (contains search, case-insensitive)
        class_number_search = search_data.get('class_number', None)
        if class_number_search:
            queryset = queryset.filter(class_number__icontains=class_number_search)
            print(f"Filtered by class_number, queryset count: {queryset.count()}")

        # 4. Filter by title (exact match, case-insensitive)
        title = search_data.get('title', None)
        if title:
            queryset = queryset.filter(title__iexact=title)
            print(f"Filtered by title, queryset count: {queryset.count()}")

        # 5. Filter by description (contains search, case-insensitive)
        description_search = search_data.get('description', None)
        if description_search:
            queryset = queryset.filter(description__icontains=description_search)
            print(f"Filtered by description, queryset count: {queryset.count()}")

        # 6. Filter by credits (exact integer match)
        credit_count = search_data.get('credits', None)
        if credit_count is not None:
            queryset = queryset.filter(credits=credit_count)
            print(f"Filtered by credits, queryset count: {queryset.count()}")

        # 7. Filter by editable credits (boolean field)
        editable_credits = search_data.get('editable_credits', None)
        if editable_credits is not None:
            queryset = queryset.filter(editable_credits=bool(int(editable_credits)))
            print(f"Filtered by editable_credits, queryset count: {queryset.count()}")

        # 8. Filter by elective field ID
        elective_field_id = search_data.get('elective_field_id', None)
        if elective_field_id is not None:
            queryset = queryset.filter(elective_field_id=elective_field_id)
            print(f"Filtered by elective_field_id, queryset count: {queryset.count()}")

        # 9. Filter by prerequisites using JSONField 'prereq_groups'
        prereq_ids = search_data.get('prereq_id', None)
        if prereq_ids:
            prereq_id_list = [int(i) for i in prereq_ids.split(',')]

            def course_has_all_prereqs(course):
                all_ids = [item for group in course.prereq_groups for item in group]
                return all(pr in all_ids for pr in prereq_id_list)

            # Filter in Python (not efficient for large datasets)
            matching_ids = [
                course.id for course in queryset if course_has_all_prereqs(course)
            ]

            queryset = queryset.filter(id__in=matching_ids)
            print(f"Filtered by prereq_groups, queryset count: {queryset.count()}")

        # 10. Filter by seasons (comma-separated string, matches multiple seasons)
        seasons_param = search_data.get('seasons', None)
        if seasons_param:
            seasons = seasons_param.split(',')
            seasons = [int(season) for season in seasons]
            # First filter by seasons__name__in to only include matching seasons
            queryset = queryset.filter(seasons__in=seasons).distinct()
            queryset = queryset.annotate(num_matching_seasons=Count('seasons', filter=Q(seasons__in=seasons))).filter(
                num_matching_seasons=len(seasons))
            print(f"Filtered by seasons, queryset count: {queryset.count()}")

        # 11. Filter by corequisites (exact match by ID)
        coreq_ids = search_data.get('coreq_id', None)
        if coreq_ids:
            coreq_id_list = [int(i) for i in coreq_ids.split(',')]

            def course_has_all_coreqs(course):
                all_ids = [item for group in course.coreq_groups for item in group]
                return all(pr in all_ids for pr in coreq_id_list)

            # Filter in Python (not efficient for large datasets)
            matching_ids = [
                course.id for course in queryset if course_has_all_coreqs(course)
            ]

            queryset = queryset.filter(id__in=matching_ids)
            print(f"Filtered by coreq_groups, queryset count: {queryset.count()}")

        # Serialize the filtered queryset
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)
