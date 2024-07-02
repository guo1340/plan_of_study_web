from rest_framework.routers import DefaultRouter
from .views import ElectiveFieldViewSet

elective_field_router = DefaultRouter()
elective_field_router.register('', ElectiveFieldViewSet, basename='elective-field')
urlpatterns = elective_field_router.urls
