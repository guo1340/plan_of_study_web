from rest_framework.routers import DefaultRouter
from .views import SemesterViewSet

semester_router = DefaultRouter()
semester_router.register('', SemesterViewSet, basename='semester')
urlpatterns = semester_router.urls
