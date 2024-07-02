from rest_framework.routers import DefaultRouter
from classes.urls import class_router
from semester.urls import semester_router
from template.urls import template_router
from elective_field.urls import elective_field_router
from django.urls import path, include

class_routers = DefaultRouter()
class_routers.registry.extend(class_router.registry)
semester_routers = DefaultRouter()
semester_routers.registry.extend(semester_router.registry)
template_routers = DefaultRouter()
template_routers.registry.extend(template_router.registry)
elective_field_routers = DefaultRouter()
elective_field_routers.registry.extend(elective_field_router.registry)

urlpatterns = [
    path('classes/', include(class_routers.urls)),
    path('semester/', include(semester_routers.urls)),
    path('template/', include(template_routers.urls)),
    path('elective-field/', include(elective_field_routers.urls))
]
