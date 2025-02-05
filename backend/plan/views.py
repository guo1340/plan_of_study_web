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
        name = request.data.get("name")
        if self.get_queryset().filter(name=name).exists():
            return Response("A plan with the same name has already been created", status=400)
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            plan = serializer.save()
            request.user.details.plans.add(plan)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        else:
            return Response(serializer.errors, status=400)

    def retrieve(self, request, pk=None):
        plan_obj = self.get_queryset().get(pk=pk)
        serializer = self.serializer_class(plan_obj)
        return Response(serializer.data)

    def update(self, request, pk=None):
        name = request.data.get("name")
        if self.get_queryset().filter(name=name).exclude(pk=pk).exists():
            return Response("A plan with the same name has already been created", status=400)
        plan_obj = self.get_queryset().get(pk=pk)
        serializer = self.serializer_class(plan_obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=400)

    def destroy(self, request, pk=None):
        plan_obj = self.get_queryset().get(pk=pk)
        plan_obj.delete()
        return Response(status=204)
