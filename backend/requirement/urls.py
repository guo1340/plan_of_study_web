from rest_framework.routers import DefaultRouter
from .views import RequirementViewSet
from django.urls import path, include

requirement_router = DefaultRouter()
requirement_router.register('', RequirementViewSet, basename='requirement')
urlpatterns = [
    path('', include(requirement_router.urls)),
]
