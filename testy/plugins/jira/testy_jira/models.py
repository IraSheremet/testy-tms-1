from django.db import models

from users.models import User


class UserInfo(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    subdomain = models.CharField(max_length=100, blank=True)
    email = models.CharField(max_length=100, blank=True)
    token = models.CharField(max_length=500, blank=True)
    selected_issue_keys = models.JSONField(default=dict, blank=True)



