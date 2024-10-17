import json

from django.shortcuts import render
from django.db.models import Q, Count
from rest_framework.viewsets import ModelViewSet
from .models import Course
from .serializers import ClassSerializer
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import PermissionDenied


class ClassViewSet(ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = ClassSerializer

    # Override get_permissions to set different permissions for different actions
    def get_permissions(self):
        # Allow unauthenticated access to certain actions
        if self.action in ['list', 'retrieve', 'list_by_elective_field', 'list_by_editable_credits', 'list_by_credits',
                           'list_by_description', 'list_by_major', 'list_by_term', 'list_by_prereq', 'list_by_coreq',
                           'list_by_class_number']:

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

    def check_admin_permission(self, request):
        # Ensure the user is authenticated
        if not request.user.is_authenticated:
            raise PermissionDenied("You must be logged in to perform this action.")

        # Check if the user has a 'details' object and if their role is 'admin'
        if not hasattr(request.user, 'details') or request.user.details.role != 'admin':
            raise PermissionDenied("You do not have permission to perform this action.")

    def create(self, request):
        self.check_admin_permission(request)  # Ensure user has admin role
        major = request.data.get("major")
        abbreviation = request.data.get("abbreviation")
        class_number = request.data.get('class_number')
        title = request.data.get("title")
        if Course.objects.filter(Q(class_number=class_number) & Q(major=major)
                                 & Q(abbreviation=abbreviation) & Q(title=title)).exists():
            return Response({"error": "A class with the same major, class number, and title already exists."},
                            status=400)
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=400)

    def update(self, request, pk=None):
        self.check_admin_permission(request)  # Ensure user has admin role
        major = request.data.get("major")
        abbreviation = request.data.get("abbreviation")
        class_number = request.data.get('class_number')
        title = request.data.get("title")
        if Course.objects.filter(Q(class_number=class_number) & Q(major=major)
                                 & Q(abbreviation=abbreviation) & Q(title=title)).exclude(pk=pk).exists():
            return Response({"error": "A class with the same major, class number, and title already exists."},
                            status=400)
        class_obj = Course.objects.all().get(pk=pk)
        serializer = self.serializer_class(class_obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=400)

    def destroy(self, request, pk=None):
        self.check_admin_permission(request)  # Ensure user has admin role
        class_obj = Course.objects.all().get(pk=pk)
        class_obj.delete()
        return Response(status=204)

    def list(self, request):
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
            queryset = queryset.filter(major__iexact=major)
            print(f"Filtered by major, queryset count: {queryset.count()}")
        # 2. Filter by abbreviation (exact match, case-insensitive)
        abbreviation = search_data.get('abbreviation', None)
        if abbreviation:
            queryset = queryset.filter(abbreviation__iexact=abbreviation)
            print(f"Filtered by abbreviation, queryset count: {queryset.count()}")

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
        if elective_field_id:
            queryset = queryset.filter(elective_field_id=elective_field_id)
            print(f"Filtered by elective_field_id, queryset count: {queryset.count()}")

        # 9. Filter by prerequisites (exact match by ID)
        prereq_ids = search_data.get('prereq_id', None)
        if prereq_ids:
            prereq_id_list = prereq_ids.split(',')
            # Filter courses that have all the given prereq_ids
            queryset = queryset.filter(prereqs__in=prereq_id_list).annotate(num_prereqs=Count('prereqs')).filter(
                num_prereqs=len(prereq_id_list))
        print(f"Filtered by all given prereqs, queryset count: {queryset.count()}")

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
            coreq_id_list = coreq_ids.split(',')
            # Filter courses that have all the given coreq_ids
            queryset = queryset.filter(coreqs__in=coreq_id_list).annotate(num_coreqs=Count('coreqs')).filter(
                num_coreqs=len(coreq_id_list))
        print(f"Filtered by all given coreqs, queryset count: {queryset.count()}")

        # Serialize the filtered queryset
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)
