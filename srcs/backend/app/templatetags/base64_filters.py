import base64
from django import template

register = template.Library()

@register.filter(name='b64encode')
def b64encode(value):
    """ Encode une image binaire en base64 """
    if value:
        return base64.b64encode(value).decode('utf-8')
    return ""
