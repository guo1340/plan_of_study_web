from rest_framework.routers import DefaultRouter
from .views import UserViewSet

template_router = DefaultRouter()
template_router.register('', UserViewSet, basename='user')
urlpatterns = template_router.urls
