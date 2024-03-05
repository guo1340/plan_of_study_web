from django.shortcuts import render
from .models import Class


# Create your views here.
def classes_home(request):
    # class = Class.object {"class": class}
    return render(request, 'classes/list.html')
