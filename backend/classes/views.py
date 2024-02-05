from django.shortcuts import render
from .models import Class


# Create your views here.
def classes_home(request):
    # classes = Class.object {"classes": classes}
    return render(request, 'classes/list.html')
