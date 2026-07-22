from django.contrib import admin
from .models import Feedback


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ["name", "email", "feedback_type", "short_content", "created_at"]
    list_filter = ["feedback_type", "created_at"]
    search_fields = ["name", "email", "content"]
    date_hierarchy = "created_at"
    list_per_page = 20
    readonly_fields = ["created_at"]
    fieldsets = [
        ("反馈人信息", {"fields": ["name", "email"]}),
        ("反馈内容", {"fields": ["feedback_type", "content"]}),
        ("时间信息", {"fields": ["created_at"]}),
    ]

    def short_content(self, obj):
        return obj.content[:50] + "..." if len(obj.content) > 50 else obj.content
    short_content.short_description = "反馈摘要"