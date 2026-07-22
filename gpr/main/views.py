from rest_framework import viewsets, permissions, filters
from .models import Feedback
from .serializers import FeedbackSerializer


class FeedbackViewSet(viewsets.ModelViewSet):
    """用户反馈 API — 联系反馈模块"""
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "email", "content"]
    ordering_fields = ["created_at"]
    ordering = ["-created_at"]