from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet

from plan.models import Plan
from .models import Semester
from .serializers import SemesterSerializer
from rest_framework.response import Response


class SemesterViewSet(ModelViewSet):
    serializer_class = SemesterSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Returns only the semesters that belong to the plans owned by the authenticated user.
        """
        user_plans = self.request.user.details.plans.all()  # Get the user's plans
        return Semester.objects.filter(plan__in=user_plans)  # Filter semesters by those plans

    def list(self, request):
        queryset = self.get_queryset()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    from django.contrib.auth import get_user_model

    def create(self, request):
        plan_id = request.data.get("plan")

        # Refresh the user details object before checking permissions
        request.user.details.refresh_from_db()

        if not Plan.objects.filter(id=plan_id, id__in=request.user.details.plans.values_list("id", flat=True)).exists():
            return Response({"error": "You do not have permission to add a semester to this plan."},
                            status=status.HTTP_403_FORBIDDEN)

        # Extract year and season from request data
        year = request.data.get("year")
        season = request.data.get("season")

        # Check if a semester with the same year and season already exists in the plan
        if Semester.objects.filter(id__in=Plan.objects.get(id=plan_id).semesters.values_list("id", flat=True),
                                   year=year, season=season).exists():
            return Response({"error": "A semester with the same year and season already exists in this plan."},
                            status=status.HTTP_400_BAD_REQUEST)
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            semester = serializer.save()  # Save semester
            plan = Plan.objects.get(id=plan_id)  # Get plan
            plan.semesters.add(semester)  # Link semester to plan
            plan.save()

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk=None):
        semester_obj = self.get_queryset().get(pk=pk)
        serializer = self.serializer_class(semester_obj)
        return Response(serializer.data)

    def update(self, request, pk=None):
        semester_obj = self.get_queryset().get(pk=pk)
        serializer = self.serializer_class(semester_obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        semester_obj = self.get_queryset().get(pk=pk)
        semester_obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
