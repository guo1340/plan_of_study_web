from rest_framework.viewsets import ModelViewSet
from .models import Template
from .serializers import TemplateSerializer
from rest_framework.response import Response
from rest_framework.decorators import action


class TemplateViewSet(ModelViewSet):
    queryset = Template.objects.all()
    serializer_class = TemplateSerializer

    def list(self, request):
        queryset = Template.objects.all()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    def create(self, request):
        major = request.data.get('major')
        if Template.objects.filter(major=major).exists():
            return Response({"error": "An Template with this major already exists."}, status=400)
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=400)

    def retrieve(self, request, pk=None):
        template_obj = Template.objects.all().get(pk=pk)
        serializer = self.serializer_class(template_obj)
        return Response(serializer.data)

    def update(self, request, pk=None):
        template_obj = Template.objects.all().get(pk=pk)
        major = request.data.get('major')
        if Template.objects.filter(major=major).exclude(pk=pk).exists():
            return Response({"error": "A template with this major already exists."}, status=400)
        serializer = self.serializer_class(template_obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=400)

    def destroy(self, request, pk=None):
        template_obj = Template.objects.all().get(pk=pk)
        template_obj.delete()
        return Response(status=204)

    # localhost:8000/api/classes/by-major/?major=<major>
    @action(detail=False, methods=['get'], url_path='by-major')
    def list_by_major(self, request):
        major_name = request.query_params.get('major', None)
        if major_name:
            queryset = Template.objects.filter(major=major_name)
            serializer = self.serializer_class(queryset, many=True)
            return Response(serializer.data)
        else:
            return Response({"error": "No major name provided"}, status=400)

