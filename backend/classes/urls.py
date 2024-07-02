from rest_framework.routers import DefaultRouter
from .views import ClassViewSet

class_router = DefaultRouter()
class_router.register('', ClassViewSet, basename='class')
urlpatterns = class_router.urls
