import requests
import json

from testy_jira.models import UserInfo

JIRA_CONFIG = {
    'summary': "Summary",
    "description/content/0/content/0/text": "Description",
    "reporter/displayName": "Имя репортера",
}


def get_fields(user):
    email = user.email
    token = user.token
    subdomain = user.subdomain
    response = requests.get(f'https://{subdomain}.atlassian.net/rest/api/3/field',
                            auth=(email, token))
    response_dist = response.json()
    names = map(lambda field: {"key": field['key'], "value": field['name']}, response_dist)
    return list(names)


def get_nested(value, path):
    try:
        for p in path:
            if isinstance(value, list):
                value = value[int(p)]
            else:
                value = value[p]
    except:
        value = "некорректный путь :("
    return value


def get_jira_issue_info(issue_key: str, user: UserInfo):
    email = user.email
    token = user.token
    subdomain = user.subdomain
    # issues_fields = JIRA_CONFIG
    issues_fields = user.selected_issue_keys
    issues_keys = list((map(lambda key: key.split("/")[0], issues_fields.keys())))
    fields = ",".join(issues_keys)
    response = requests.get(
        f'https://{subdomain}.atlassian.net/rest/api/3/issue/{issue_key}?fields={fields}',
        auth=(email, token))
    if response.status_code == 200:
        response_dist = response.json()
        result = ""
        print(json.dumps(response_dist, indent=4))
        for fieldId, value in issues_fields.items():
            fieldIds = fieldId.split("/")
            fieldIds.insert(0, 'fields')
            result += f"{value}: {get_nested(response_dist, fieldIds)}\n"
        return result
    else:
        print(f"Ошибка {response.status_code}: {response.text}")
        return {}

