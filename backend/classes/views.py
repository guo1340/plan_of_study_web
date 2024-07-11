# from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet
from .models import Course
from .serializers import ClassSerializer
from rest_framework.response import Response
from rest_framework.decorators import action


class ClassViewSet(ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = ClassSerializer

    def list(self, request):
        queryset = Course.objects.all()
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
        class_obj = Course.objects.all().get(pk=pk)
        serializer = self.serializer_class(class_obj)
        return Response(serializer.data)

    def update(self, request, pk=None):
        class_obj = Course.objects.all().get(pk=pk)
        serializer = self.serializer_class(class_obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=400)

    def destroy(self, request, pk=None):
        class_obj = Course.objects.all().get(pk=pk)
        class_obj.delete()
        return Response(status=204)

    # localhost:8000/api/classes/by-elective-field/<elective-field-id>
    @action(detail=False, methods=['get'], url_path='by-elective-field/(?P<elective_field_id>\d+)')
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
    @action(detail=False, methods=['get'], url_path='by-credits/(?P<credit_count>\d+)')
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

    # localhost:8000/api/classes/by-term/?term=<term>
    @action(detail=False, methods=['get'], url_path='by-term')
    def list_by_term(self, request):
        term = request.query_params.get('term', None)
        if term:
            queryset = Course.objects.filter(term=term)
            serializer = self.serializer_class(queryset, many=True)
            return Response(serializer.data)
        else:
            return Response({"error": "No term provided"}, status=400)

    # localhost:8000/api/classes/by-prereq/<id>/
    @action(detail=False, methods=['get'], url_path='by-prereq/(?P<prereq_id>\d+)')
    def list_by_prereq(self, request, prereq_id=None):
        queryset = Course.objects.filter(prereqs=prereq_id)
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    # localhost:8000/api/classes/by-coreq/<id>/
    @action(detail=False, methods=['get'], url_path='by-coreq/(?P<coreq_id>\d+)')
    def list_by_coreq(self, request, coreq_id=None):
        queryset = Course.objects.filter(coreqs=coreq_id)
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    # localhost:8000/api/classes/by-class-number/?search=<search-text>
    @action(detail=False, methods=['get'], url_path='by-class-number')
    def list_by_description(self, request):
        search_text = request.query_params.get('search', None)
        if search_text:
            queryset = Course.objects.filter(class_number__icontains=search_text)
            serializer = self.serializer_class(queryset, many=True)
            return Response(serializer.data)
        else:
            return Response({"error": "No search text provided"}, status=400)
