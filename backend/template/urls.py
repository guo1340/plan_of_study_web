from rest_framework.routers import DefaultRouter
from .views import TemplateViewSet

template_router = DefaultRouter()
template_router.register('', TemplateViewSet, basename='template')
urlpatterns = template_router.urls
