from django.urls import path
from . import views

app_name = 'class'
urlpatterns = [
    path('', views.classes_home, name='classes_home'),
]
