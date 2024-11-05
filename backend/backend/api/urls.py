from rest_framework.routers import DefaultRouter
from classes.urls import class_router
from semester.urls import semester_router
from template.urls import template_router
from elective_field.urls import elective_field_router
from plan.urls import plan_router
from season.urls import season_router
from users.urls import user_router
from major.urls import major_router
from requirement.urls import requirement_router
from credit_type.urls import credit_type_router
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from users.views import (UserRegistrationView, LogoutView, LoginView)


class_routers = DefaultRouter()
class_routers.registry.extend(class_router.registry)
semester_routers = DefaultRouter()
semester_routers.registry.extend(semester_router.registry)
template_routers = DefaultRouter()
template_routers.registry.extend(template_router.registry)
elective_field_routers = DefaultRouter()
elective_field_routers.registry.extend(elective_field_router.registry)
plan_routers = DefaultRouter()
plan_routers.registry.extend(plan_router.registry)
season_routers = DefaultRouter()
season_routers.registry.extend(season_router.registry)
user_routers = DefaultRouter()
user_routers.registry.extend(user_router.registry)
major_routers = DefaultRouter()
major_routers.registry.extend(major_router.registry)
credit_type_routers = DefaultRouter()
credit_type_routers.registry.extend(credit_type_router.registry)
requirement_routers = DefaultRouter()
requirement_routers.registry.extend(requirement_router.registry)


urlpatterns = [
    path('classes/', include(class_routers.urls)),
    path('semester/', include(semester_routers.urls)),
    path('template/', include(template_routers.urls)),
    path('elective-field/', include(elective_field_routers.urls)),
    path('plan/', include(plan_routers.urls)),
    path('season/', include(season_routers.urls)),
    path('user/', include(user_routers.urls)),
    path('major/', include(major_routers.urls)),
    path('requirement/', include(requirement_routers.urls)),
    path('credit_type/', include(credit_type_routers.urls)),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', UserRegistrationView.as_view(), name='user_register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
]
