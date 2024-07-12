from rest_framework.viewsets import ModelViewSet
from .models import Season
from .serializers import SeasonSerializer
from rest_framework.response import Response


class SeasonViewSet(ModelViewSet):
    queryset = Season.objects.all()
    serializer_class = SeasonSerializer

    def list(self, request):
        queryset = Season.objects.all()
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
        season_obj = Season.objects.all().get(pk=pk)
        serializer = self.serializer_class(season_obj)
        return Response(serializer.data)

    def update(self, request, pk=None):
        season_obj = Season.objects.all().get(pk=pk)
        serializer = self.serializer_class(season_obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=400)

    def destroy(self, request, pk=None):
        season_obj = Season.objects.all().get(pk=pk)
        season_obj.delete()
        return Response(status=204)
