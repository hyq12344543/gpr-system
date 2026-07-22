from django.db import models


class Feedback(models.Model):
    name = models.CharField("姓名", max_length=50)
    email = models.EmailField("邮箱", max_length=100)
    feedback_type = models.CharField("反馈类型", max_length=50)
    content = models.TextField("反馈内容")
    created_at = models.DateTimeField("创建时间", auto_now_add=True)

    class Meta:
        db_table = "feedback"
        verbose_name = "用户反馈"
        verbose_name_plural = "用户反馈"
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.feedback_type}] {self.name}"