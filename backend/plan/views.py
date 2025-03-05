from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from .models import Plan
from .serializers import PlanSerializer
from rest_framework.response import Response


class PlanViewSet(ModelViewSet):
    serializer_class = PlanSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Returns only the plans that belong to the authenticated user.
        """
        return Plan.objects.filter(id__in=self.request.user.details.plans.all())  # Fetch user's plans

    def list(self, request):
        queryset = self.get_queryset()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    def create(self, request):
        """
        Create a new plan. Ensures that a plan with the same name does not exist.
        """
        name = request.data.get("name")
        if self.get_queryset().filter(name=name).exists():
            return Response({"error": "A plan with the same name has already been created"}, status=400)

        # Initialize with empty course_cart if not provided
        request_data = request.data.copy()
        request_data["course_cart"] = request_data.get("course_cart", [])

        serializer = self.serializer_class(data=request_data)
        if serializer.is_valid():
            plan = serializer.save()
            request.user.details.plans.add(plan)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=400)

    def retrieve(self, request, pk=None):
        """
        Retrieve a specific plan by ID.
        """
        try:
            plan_obj = self.get_queryset().get(pk=pk)
            serializer = self.serializer_class(plan_obj)
            return Response(serializer.data)
        except Plan.DoesNotExist:
            return Response({"error": "Plan not found"}, status=404)

    def update(self, request, pk=None):
        """
        Update an existing plan. Ensures that plan names remain unique.
        """
        try:
            plan_obj = self.get_queryset().get(pk=pk)
        except Plan.DoesNotExist:
            return Response({"error": "Plan not found"}, status=404)

        name = request.data.get("name")
        if self.get_queryset().filter(name=name).exclude(pk=pk).exists():
            return Response({"error": "A plan with the same name has already been created"}, status=400)

        # Ensure course_cart structure is valid
        request_data = request.data.copy()
        request_data["course_cart"] = request_data.get("course_cart", plan_obj.course_cart)

        serializer = self.serializer_class(plan_obj, data=request_data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def destroy(self, request, pk=None):
        """
        Delete a plan.
        """
        try:
            plan_obj = self.get_queryset().get(pk=pk)
            plan_obj.delete()
            return Response(status=204)
        except Plan.DoesNotExist:
            return Response({"error": "Plan not found"}, status=404)

    def add_course(self, request, pk=None):
        """
        Add a course to the plan's course_cart.
        """
        try:
            plan = self.get_queryset().get(pk=pk)
        except Plan.DoesNotExist:
            return Response({"error": "Plan not found"}, status=404)

        course_data = request.data.get("course")
        if not course_data or "course_id" not in course_data:
            return Response({"error": "Invalid course data"}, status=400)

        # Ensure uniqueness of course_id in course_cart
        if any(course["course_id"] == course_data["course_id"] for course in plan.course_cart):
            return Response({"error": "Course already in plan"}, status=400)

        plan.course_cart.append(course_data)
        plan.save()
        return Response(plan.course_cart, status=200)

    def remove_course(self, request, pk=None):
        """
        Remove a course from the plan's course_cart.
        """
        try:
            plan = self.get_queryset().get(pk=pk)
        except Plan.DoesNotExist:
            return Response({"error": "Plan not found"}, status=404)

        course_id = request.data.get("course_id")
        if not course_id:
            return Response({"error": "Course ID required"}, status=400)

        updated_cart = [course for course in plan.course_cart if course["course_id"] != course_id]
        if len(updated_cart) == len(plan.course_cart):
            return Response({"error": "Course not found in plan"}, status=400)

        plan.course_cart = updated_cart
        plan.save()
        return Response(plan.course_cart, status=200)
