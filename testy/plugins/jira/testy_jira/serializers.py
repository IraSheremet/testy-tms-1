from rest_framework.relations import HyperlinkedIdentityField
from rest_framework.serializers import ModelSerializer

from testy_jira.models import UserInfo


class UserInfoSerializer(ModelSerializer):
    url = HyperlinkedIdentityField(view_name='plugins:testy_jira:userinfo-detail')

    class Meta:
        model = UserInfo
        fields = ('url', 'user', 'subdomain', 'email', 'token', 'selected_issue_keys')

