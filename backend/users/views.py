from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from .models import Details
from .serializers import DetailsSerializer
from rest_framework.permissions import IsAuthenticated


class UserViewSet(viewsets.ModelViewSet):
    queryset = Details.objects.all()
    serializer_class = DetailsSerializer
    permission_classes = [IsAuthenticated]  # Ensure that only authenticated users can access these views

    def get_queryset(self):
        # Check if the user is authenticated and filter the queryset based on the user's role
        if self.request.user.is_authenticated:
            user_role = self.request.user.details.role  # Access the role from the related Details model
            if user_role == 'admin':
                return Details.objects.all()  # Admin can see all details
            else:
                return Details.objects.filter(user=self.request.user)  # Regular users can only see their own details
        return Details.objects.none()

    def create(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)  # Associate the new details with the authenticated user
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        if instance.user != request.user and request.user.details.role != 'admin':
            return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        instance = self.get_object()

        if instance.user != request.user and request.user.details.role != 'admin':
            return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        instance.user.delete()  # Deleting the associated User object
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def retrieve(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        instance = self.get_object()

        if instance.user != request.user and request.user.details.role != 'admin':
            return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def list(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
