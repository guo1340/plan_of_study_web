from rest_framework.routers import DefaultRouter
from .views import SeasonViewSet

season_router = DefaultRouter()
season_router.register('', SeasonViewSet, basename='season')
urlpatterns = season_router.urls
