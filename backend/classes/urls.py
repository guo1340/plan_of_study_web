from rest_framework.routers import DefaultRouter
from .views import ClassViewSet
from django.urls import path, include


class_router = DefaultRouter()
class_router.register('', ClassViewSet, basename='class')
urlpatterns = [
    path('', include(class_router.urls)),
]