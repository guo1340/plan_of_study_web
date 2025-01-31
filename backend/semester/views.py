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

    def create(self, request):
        plan_id = request.data.get("plan")

        # Ensure the plan belongs to the user
        if not Plan.objects.filter(id=plan_id, id__in=request.user.details.plans.all()).exists():
            return Response({"error": "You do not have permission to add a semester to this plan."},
                            status=status.HTTP_403_FORBIDDEN)

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
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
