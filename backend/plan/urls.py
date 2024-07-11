from rest_framework.routers import DefaultRouter
from .views import PlanViewSet

plan_router = DefaultRouter()
plan_router.register('', PlanViewSet, basename='plan')
urlpatterns = plan_router.urls
