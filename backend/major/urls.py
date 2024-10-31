from rest_framework.routers import DefaultRouter
from .views import MajorViewSet
from django.urls import path, include

major_router = DefaultRouter()
major_router.register('', MajorViewSet, basename='major')
urlpatterns = [
    path('', include(major_router.urls)),
]
