# from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet
from .models import Class
from .serializers import ClassSerializer


# Create your views here.
# def classes_list(request):
#     class_list = Class.objects.all()
#     # classes = Class.object {"classes": classes}
#     return render(request, 'classes/list.html', {"class_list": class_list})
#

class ClassViewSet(ModelViewSet):
    queryset = Class.objects.all()
    serializer_class = ClassSerializer
