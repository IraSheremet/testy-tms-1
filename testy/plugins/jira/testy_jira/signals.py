from django.db.models.signals import pre_save
from django.dispatch import receiver

from testy_jira.utils import *
from testy_jira.models import UserInfo
from tests_representation.models import TestResult

pattern = "jira[]"


# @receiver(pre_save, sender=TestResult)
# def replace_jira_prefix(sender, instance, **kwargs):
#     try:
#         if instance.comment:
#             user = UserInfo.objects.get_or_create(user=instance.user)
#             # TODO добавить создание
#             subdomain = user.subdomain
#             indexes = [i for i in range(len(instance.comment)) if instance.comment.startswith('jira[', i)]
#             indexes.reverse()
#             for index in indexes:
#                 key = instance.comment[(index + len(pattern) - 1):].partition("]")[0]
#                 url = "https://" + subdomain + ".atlassian.net/browse/" + str(key)
#                 # get_keys(key, user)
#                 get_fields(user)
#                 tooltip = get_jira_issue_info(key, user)
#                 jira_link = f'[{key}]({url} "{tooltip}")'
#
#                 instance.comment = instance.comment[:index] + jira_link + instance.comment[
#                                                                           index + len(key) + len(pattern):]
#     except ConnectionError:
#         print("No Internet connection")
