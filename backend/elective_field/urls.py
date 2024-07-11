from rest_framework.routers import DefaultRouter
from .views import ElectiveFieldViewSet
from django.urls import path, include


elective_field_router = DefaultRouter()
elective_field_router.register('', ElectiveFieldViewSet, basename='elective-field')

urlpatterns = [
    path('elective-fields/major/<str:major>/', ElectiveFieldViewSet.as_view({'get': 'list_by_major'})),
    path('elective-fields/majors/', ElectiveFieldViewSet.as_view({'get': 'list_majors'})),
    path('', include(elective_field_router.urls)),
]
