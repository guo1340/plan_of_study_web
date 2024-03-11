# from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet
from .models import Class
from .serializers import ClassSerializer
from rest_framework.response import Response


# Create your views here.
# def classes_list(request):
#     class_list = Class.objects.all()
#     # classes = Class.object {"classes": classes}
#     return render(request, 'classes/list.html', {"class_list": class_list})
#

class ClassViewSet(ModelViewSet):
    queryset = Class.objects.all()
    serializer_class = ClassSerializer

    def list(self, request):
        queryset = self.queryset
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
        class_obj = self.queryset.get(pk=pk)
        serializer = self.serializer_class(class_obj)
        return Response(serializer.data)

    def update(self, request, pk=None):
        class_obj = self.queryset.get(pk=pk)
        serializer = self.serializer_class(class_obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=400)

    def destroy(self, request, pk=None):
        class_obj = self.queryset.get(pk=pk)
        class_obj.delete()
        return Response(status=204)