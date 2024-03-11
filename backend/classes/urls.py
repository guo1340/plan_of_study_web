from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import ClassViewSet

class_router = DefaultRouter()
class_router.register('classes', ClassViewSet, basename='class')
urlpatterns = class_router.urls

# app_name = 'classes'
# urlpatterns = [
#     path('', views.classes_list, name='class_list'),
# ]
