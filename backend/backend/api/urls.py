from rest_framework.routers import DefaultRouter
from classes.urls import class_router
from django.urls import path, include

router = DefaultRouter()
router.registry.extend(class_router.registry)

urlpatterns = [
    path('', include(router.urls))
]
