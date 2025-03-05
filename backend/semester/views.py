from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response

from plan.models import Plan
from .models import Semester
from .serializers import SemesterSerializer


class SemesterViewSet(ModelViewSet):
    serializer_class = SemesterSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Returns only the semesters that belong to the plans owned by the authenticated user.
        """
        user_plans = self.request.user.details.plans.all()  # Get the user's plans
        return Semester.objects.filter(id__in=user_plans.values_list("semesters", flat=True))

    def list(self, request):
        queryset = self.get_queryset()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    def create(self, request):
        """
        Create a new semester, ensuring uniqueness within a plan.
        """
        plan_id = request.data.get("plan")

        # Refresh the user details object before checking permissions
        request.user.details.refresh_from_db()

        if not Plan.objects.filter(id=plan_id, id__in=request.user.details.plans.values_list("id", flat=True)).exists():
            return Response({"error": "You do not have permission to add a semester to this plan."},
                            status=status.HTTP_403_FORBIDDEN)

        # Extract year and season from request data
        year = request.data.get("year")
        season = request.data.get("season")

        # Check for duplicate semester within the plan
        if Semester.objects.filter(id__in=Plan.objects.get(id=plan_id).semesters.values_list("id", flat=True),
                                   year=year, season=season).exists():
            return Response({"error": "A semester with the same year and season already exists in this plan."},
                            status=status.HTTP_400_BAD_REQUEST)

        # Ensure the `classes` field is always initialized properly
        request_data = request.data.copy()
        request_data["classes"] = request_data.get("classes", [])

        serializer = self.serializer_class(data=request_data)
        if serializer.is_valid():
            semester = serializer.save()
            plan = Plan.objects.get(id=plan_id)
            plan.semesters.add(semester)
            plan.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk=None):
        """
        Retrieve a semester.
        """
        try:
            semester_obj = self.get_queryset().get(pk=pk)
            serializer = self.serializer_class(semester_obj)
            return Response(serializer.data)
        except Semester.DoesNotExist:
            return Response({"error": "Semester not found"}, status=status.HTTP_404_NOT_FOUND)

    def update(self, request, pk=None):
        """
        Update a semester.
        """
        try:
            semester_obj = self.get_queryset().get(pk=pk)
        except Semester.DoesNotExist:
            return Response({"error": "Semester not found"}, status=status.HTTP_404_NOT_FOUND)

        # Ensure `classes` field structure remains intact
        request_data = request.data.copy()
        request_data["classes"] = request_data.get("classes", semester_obj.classes)

        serializer = self.serializer_class(semester_obj, data=request_data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        """
        Delete a semester.
        """
        try:
            semester_obj = self.get_queryset().get(pk=pk)
            semester_obj.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Semester.DoesNotExist:
            return Response({"error": "Semester not found"}, status=status.HTTP_404_NOT_FOUND)

    def add_course(self, request, pk=None):
        """
        Add a course to a semester.
        """
        try:
            semester = self.get_queryset().get(pk=pk)
        except Semester.DoesNotExist:
            return Response({"error": "Semester not found"}, status=status.HTTP_404_NOT_FOUND)

        course_data = request.data.get("course")
        if not course_data or "course_id" not in course_data:
            return Response({"error": "Invalid course data"}, status=status.HTTP_400_BAD_REQUEST)

        # Ensure uniqueness of course_id in classes
        if any(course["course_id"] == course_data["course_id"] for course in semester.classes):
            return Response({"error": "Course already in semester"}, status=status.HTTP_400_BAD_REQUEST)

        semester.classes.append(course_data)
        semester.save()
        return Response(semester.classes, status=status.HTTP_200_OK)

    def remove_course(self, request, pk=None):
        """
        Remove a course from a semester.
        """
        try:
            semester = self.get_queryset().get(pk=pk)
        except Semester.DoesNotExist:
            return Response({"error": "Semester not found"}, status=status.HTTP_404_NOT_FOUND)

        course_id = request.data.get("course_id")
        if not course_id:
            return Response({"error": "Course ID required"}, status=status.HTTP_400_BAD_REQUEST)

        updated_classes = [course for course in semester.classes if course["course_id"] != course_id]
        if len(updated_classes) == len(semester.classes):
            return Response({"error": "Course not found in semester"}, status=status.HTTP_400_BAD_REQUEST)

        semester.classes = updated_classes
        semester.save()
        return Response(semester.classes, status=status.HTTP_200_OK)
