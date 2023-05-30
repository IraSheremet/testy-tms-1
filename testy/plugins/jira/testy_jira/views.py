import requests
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet

from testy_jira.utils import get_jira_issue_info, get_fields
from testy_jira.models import UserInfo
from testy_jira.serializers import UserInfoSerializer


class UserInfoViewSet(ModelViewSet):
    queryset = UserInfo.objects.all()
    serializer_class = UserInfoSerializer

    @action(methods=['get', 'patch'], url_path='me', url_name='me', detail=False)
    def me(self, request):
        jira_user = UserInfo.objects.get(user=request.user)
        if request.method == 'GET':
            return Response(self.get_serializer(jira_user).data)
        serializer = self.get_serializer(jira_user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)


pattern = "jira[]"


class ChangeComment(APIView):
    @staticmethod
    def get(request: Request):
        user, _ = UserInfo.objects.get_or_create(user=request.user)
        subdomain = user.subdomain
        comment = request.GET.get("comment")
        indexes = [i for i in range(len(comment)) if comment.startswith('jira[', i)]
        indexes.reverse()
        for index in indexes:
            key = comment[(index + len(pattern) - 1):].partition("]")[0]
            url = "https://" + subdomain + ".atlassian.net/browse/" + str(key)
            tooltip = get_jira_issue_info(key, user)
            jira_link = f'[{key}]({url} "{tooltip}")'

            comment = comment[:index] + jira_link + comment[
                                                    index + len(key) + len(pattern):]
        return Response(comment, status=status.HTTP_200_OK)


class GetFields(APIView):
    @staticmethod
    def get(request: Request):
        user, _ = UserInfo.objects.get_or_create(user=request.user)
        fields = get_fields(user)
        # TODO сортировка по алфавиту и выбранные наверх
        replacements = {
            "status": "status/name",
            "assignee": "assignee/displayName",
            "issuetype": "issuetype/name",
            "project": "project/name",
            "watches": "watches/watchCount",
            "priority": "priority/name"
        #     TODO "parent", "fixVersions" -- нужно в jira, statusCategory, resolution, resolutiondate, issuerestriction, thumbnail, labels, 61de211f-8732-44ee-ace2-490fbca80575__PRODUCTION__compass-jira-integration-custom-field(?),
        #     timeestimate, aggregatetimeoriginalestimate, 
        }

        for field in fields:
            new_key = replacements.get(field["key"])
            if new_key:
                field["key"] = new_key

                if field["key"] == "issuetype/name":
                    fields.append({"key": "issuetype/description", "value": field["value"] + " (description)"})
        # TODO уточнить формат времени и перекинуть это в изменение комментария, lastViewed, created
        # TODO timespent == None, aggregatetimespent, resolution, resolutiondate == None
        return Response(fields, status=status.HTTP_200_OK)


class GetFieldInfo(APIView):
    @staticmethod
    def get(request: Request):
        field_id = request.GET.get("fieldid")
        user = UserInfo.objects.get(user=request.user)
        email = user.email
        token = user.token
        subdomain = user.subdomain
        response = requests.get(f'https://{subdomain}.atlassian.net/rest/api/3/field/{field_id}/option',
                                auth=(email, token))
        response_dist = response.json()
        return Response(response_dist, status=status.HTTP_200_OK)
