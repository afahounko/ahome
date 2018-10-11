
# All Rights Reserved.

# Python
import base64
import json
import yaml
import logging
import os
import re
import subprocess
import stat
import sys
import urllib
import urlparse
import threading
import contextlib
import tempfile
import six
import psutil
from functools import reduce
from StringIO import StringIO

from decimal import Decimal

# Decorator
from decorator import decorator

# Django
from django.core.exceptions import ObjectDoesNotExist
from django.db import DatabaseError
from django.utils.translation import ugettext_lazy as _
from django.db.models.fields.related import ForeignObjectRel, ManyToManyField
from django.db.models.query import QuerySet
from django.db.models import Q

# Django REST Framework
from rest_framework.exceptions import ParseError, PermissionDenied
from django.utils.encoding import smart_str
from django.utils.text import slugify
from django.apps import apps

logger = logging.getLogger('awx.ipam.utils')



# def demo():
# 	return { "demo": "test" }


def wizard_slugify(s):
    """
    Simplifies ugly strings into something URL-friendly.

    >>> print slugify("[Some] _ Article's Title--")
    some-articles-title

    """

    # "[Some] _ Article's Title--"
    # "[some] _ article's title--"
    s = s.lower()

    # "[some] _ article's_title--"
    # "[some]___article's_title__"
    for c in [' ', '-', '.', '/']:
        s = s.replace(c, '_')

    # "[some]___article's_title__"
    # "some___articles_title__"
    s = re.sub('\W', '', s)

    # "some___articles_title__"
    # "some   articles title  "
    s = s.replace('_', ' ')

    # "some   articles title  "
    # "some articles title "
    s = re.sub('\s+', ' ', s)

    # "some articles title "
    # "some articles title"
    s = s.strip()

    # "some articles title"
    # "some-articles-title"
    s = s.replace(' ', '_')

    return s
