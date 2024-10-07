from django.shortcuts import render
from django.db.models import Q
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
        if self.action in ['list', 'retrieve', 'list_by_elective_field', 'list_by_editable_credits', 'list_by_credits',
                           'list_by_description', 'list_by_major', 'list_by_term', 'list_by_prereq', 'list_by_coreq',
                           'list_by_class_number']:
            # Allow unauthenticated access to GET requests
            permission_classes = [AllowAny]
        else:
            # Require authentication for non-GET requests (POST, PUT, DELETE, etc.)
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

    # localhost:8000/api/classes/by-elective-field/<elective-field-id>
    @action(detail=False, methods=['get'], url_path=r'by-elective-field/(?P<elective_field_id>\d+)')
    def list_by_elective_field(self, request, elective_field_id=None):
        queryset = Course.objects.filter(elective_field_id=elective_field_id)
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    # localhost:8000/api/classes/by-editable-credits/<0(false) or 1(true)>
    @action(detail=False, methods=['get'], url_path='by-editable-credits/(?P<editable_credits>[01])')
    def list_by_editable_credits(self, request, editable_credits=None):
        queryset = Course.objects.filter(editable_credits=bool(int(editable_credits)))
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    # localhost: 8000/api/classes/by-credits/<credit_count>
    @action(detail=False, methods=['get'], url_path=r'by-credits/(?P<credit_count>\d+)')
    def list_by_editable_credits(self, request, credit_count=None):
        queryset = Course.objects.filter(credits=credit_count)
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    # localhost:8000/api/classes/by-description/?search=<search-text>
    @action(detail=False, methods=['get'], url_path='by-description')
    def list_by_description(self, request):
        search_text = request.query_params.get('search', None)
        if search_text:
            queryset = Course.objects.filter(description__icontains=search_text)
            serializer = self.serializer_class(queryset, many=True)
            return Response(serializer.data)
        else:
            return Response({"error": "No search text provided"}, status=400)

    # localhost:8000/api/classes/by-major/?major=<major>
    @action(detail=False, methods=['get'], url_path='by-major')
    def list_by_major(self, request):
        major_name = request.query_params.get('major', None)
        if major_name:
            queryset = Course.objects.filter(major=major_name)
            serializer = self.serializer_class(queryset, many=True)
            return Response(serializer.data)
        else:
            return Response({"error": "No major name provided"}, status=400)

    # localhost:8000/api/classes/by-seasons/?season=<season>,<season>
    @action(detail=False, methods=['get'], url_path='by-seasons')
    def list_by_term(self, request):
        seasons_param = request.query_params.get('season', None)
        if seasons_param:
            seasons = seasons_param.split(',')
            queryset = Course.objects.filter(seasons__name=seasons[0]).distinct()
            # print(queryset)
            for i in range(1, len(seasons)):
                queryset = queryset.filter(seasons__name=seasons[i]).distinct()
            serializer = self.serializer_class(queryset, many=True)
            return Response(serializer.data)
        else:
            return Response({"error": "No seasons provided"}, status=400)

    # localhost:8000/api/classes/by-prereq/<id>/
    @action(detail=False, methods=['get'], url_path=r'by-prereq/(?P<prereq_id>\d+)')
    def list_by_prereq(self, request, prereq_id=None):
        queryset = Course.objects.filter(prereqs=prereq_id)
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    # localhost:8000/api/classes/by-coreq/<id>/
    @action(detail=False, methods=['get'], url_path=r'by-coreq/(?P<coreq_id>\d+)')
    def list_by_coreq(self, request, coreq_id=None):
        queryset = Course.objects.filter(coreqs=coreq_id)
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    # localhost:8000/api/classes/by-class-number/?search=<search-text>
    @action(detail=False, methods=['get'], url_path='by-class-number')
    def list_by_class_number(self, request):
        search_text = request.query_params.get('search', None)
        if search_text:
            queryset = Course.objects.filter(class_number__icontains=search_text)
            serializer = self.serializer_class(queryset, many=True)
            return Response(serializer.data)
        else:
            return Response({"error": "No search text provided"}, status=400)
