from rest_framework.routers import DefaultRouter
from .views import CreditTypeViewSet
from django.urls import path, include

credit_type_router = DefaultRouter()
credit_type_router.register('', CreditTypeViewSet, basename='credit_type')
urlpatterns = [
    path('', include(credit_type_router.urls)),
]
