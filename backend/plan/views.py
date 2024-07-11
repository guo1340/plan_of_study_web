from rest_framework.viewsets import ModelViewSet
from .models import Plan
from .serializers import PlanSerializer
from rest_framework.response import Response


class PlanViewSet(ModelViewSet):
    queryset = Plan.objects.all()
    serializer_class = PlanSerializer

    def list(self, request):
        queryset = Plan.objects.all()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=400)

    def retrieve(self, request, pk=None):
        plan_obj = Plan.objects.all().get(pk=pk)
        serializer = self.serializer_class(plan_obj)
        return Response(serializer.data)

    def update(self, request, pk=None):
        plan_obj = Plan.objects.all().get(pk=pk)
        serializer = self.serializer_class(plan_obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=400)

    def destroy(self, request, pk=None):
        plan_obj = Plan.objects.all().get(pk=pk)
        plan_obj.delete()
        return Response(status=204)
