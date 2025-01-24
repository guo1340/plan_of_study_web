from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from .models import Details
from .serializers import DetailsSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics, permissions
from django.contrib.auth.models import User
from .serializers import UserSerializer
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny



class UserViewSet(viewsets.ModelViewSet):
    queryset = Details.objects.all()
    serializer_class = DetailsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Filter based on user role
        if self.request.user.is_authenticated:
            user_role = self.request.user.details.role  # Access the role from the related Details model
            if user_role == 'admin':
                return Details.objects.all()  # Admin can see all details
            else:
                return Details.objects.filter(user=self.request.user)  # Regular users see their own details
        return Details.objects.none()

    @action(detail=False, methods=['get'], url_path='me')
    def get_current_user(self, request):
        # Custom endpoint to get only the current user's details
        queryset = Details.objects.filter(user=request.user)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        # Automatically associate the authenticated user
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        # Ensure that the user cannot change the user field
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        # Handle creation with the authenticated user
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        # Handle update with permission checks
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        if instance.user != request.user and request.user.details.role != 'admin':
            return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            self.perform_update(serializer)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        instance = self.get_object()

        if instance.user != request.user and request.user.details.role != 'admin':
            return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        instance.user.delete()  # Delete the associated User object
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

    @action(detail=False, methods=['post'], url_path='change-password')
    def change_password(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not old_password or not new_password:
            return Response(
                {"detail": "Old password and new password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not user.check_password(old_password):
            return Response(
                {"detail": "Old password is incorrect."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(new_password)
        user.save()
        return Response({"detail": "Password updated successfully."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='change-role')
    def change_role(self, request, pk=None):
        user_role = request.user.details.role  # Get the role of the authenticated user

        if user_role != 'admin':
            return Response({"detail": "Permission denied. Only admins can change roles."},
                            status=status.HTTP_403_FORBIDDEN)

        new_role = request.data.get('role')
        if not new_role:
            return Response({"detail": "New role is required."},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            details = self.get_object()  # Retrieve the `Details` object by the `pk` in the URL
            details.role = new_role
            details.save()
            return Response({"detail": f"Role updated to '{new_role}' successfully."},
                            status=status.HTTP_200_OK)
        except Details.DoesNotExist:
            return Response({"detail": "User not found."},
                            status=status.HTTP_404_NOT_FOUND)

class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            Details.objects.create(user=user, role="regular")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        username = request.data.get("username")
        password = request.data.get("password")

        if username is None or password is None:
            return Response({"detail": "Please provide both username and password."},
                            status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(username=username, password=password)
        if not user:
            return Response({"detail": "Invalid credentials."},
                            status=status.HTTP_401_UNAUTHORIZED)

        # token, created = Token.objects.get_or_create(user=user)
        # return Response({"token": token.key}, status=status.HTTP_200_OK)
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token
        return Response({
            'refresh': str(refresh),
            'access': str(access_token),
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        request.user.auth_token.delete()
        return Response({"detail": "Logged out successfully."}, status=status.HTTP_200_OK)
