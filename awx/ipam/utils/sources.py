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
from collections import OrderedDict
from datetime import timedelta


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

from awx.ipam.utils.common import * # noqa
from awx.ipam.utils import yamlordereddictloader

logger = logging.getLogger('awx.ipam.utils')


# Load environment
CURRENT = os.path.abspath(os.path.dirname(__file__))
BASE_DIR = os.path.abspath(os.path.join(CURRENT, ".."))
if os.path.exists("/opt/ipam_sources"):
    BASE_DIR = "/opt"
DIR_INFRASTRUCTURES = "%s/ipam_sources/infrastructures" % (BASE_DIR)
DIR_RESOURCES = "%s/ipam_sources/resources" % (BASE_DIR)
DIR_JOBS = "%s/ipam_sources/infrastructures" % (BASE_DIR)


def infrastructure_api_source():

    data = OrderedDict()
    _directories = os.listdir( DIR_INFRASTRUCTURES )
    for _directory in _directories:
        data[_directory] = OrderedDict()
        filepath = "%s/%s/"  % ( DIR_INFRASTRUCTURES, _directory ) 
        _files = [directory for directory in os.listdir( filepath ) if os.path.isfile(filepath+directory)]
        data[_directory]['count'] = len(_files)
        data[_directory]['results'] = []
        data[_directory]['boxes'] = OrderedDict()
        data[_directory]['related'] = OrderedDict()
        for _file in _files:
            voutput = from_yml_get_related( "%s/%s/%s"  % ( DIR_INFRASTRUCTURES, _directory, _file ) )

            data[_directory]['results'].append(voutput['id'])
            if voutput['id'] != 'form':
                data[_directory]['boxes'][voutput['id']] = OrderedDict()
                data[_directory]['boxes'][voutput['id']] = voutput
		
#		path = "%s/%s/" % (DIR_INFRASTRUCTURES, _directory)
#		_subdirectories = [directory for directory in os.listdir( path ) if os.path.isdir(path+directory)]
#		for _subdirectory in _subdirectories:
#			data[_directory][_subdirectory] = OrderedDict()
#			_subfiles = os.listdir( "%s/%s/%s"  % ( DIR_INFRASTRUCTURES, _directory, _subdirectory ) )
#			data[_directory][_subdirectory]['count'] = len(_subfiles)
#			data[_directory][_subdirectory]['results'] = []
#			data[_directory][_subdirectory]['boxes'] = OrderedDict()
#			data[_directory][_subdirectory]['related'] = OrderedDict()
#			for _subfile in _subfiles:
#				voutput = from_yml_get_related( "%s/%s/%s/%s"  % ( DIR_INFRASTRUCTURES, _directory, _subdirectory, _subfile ) )
#				data[_directory][_subdirectory]['results'].append(voutput['id'])
#				if voutput['id'] != 'form':
#					data[_directory][_subdirectory]['boxes'][voutput['id']] = OrderedDict()
#					data[_directory][_subdirectory]['boxes'][voutput['id']] = voutput
#            data[_directory]['related'][voutput['id']] =  voutput

    # data['providers'] = OrderedDict()
    # data['storages'] = OrderedDict()
    # data['networks'] = OrderedDict()
    # data['CURRENT'] = CURRENT
    # data['_BASE_DIR'] = _BASE_DIR
    # data['DIR_INFRASTRUCTURES'] = os.listdir( DIR_INFRASTRUCTURES )
    # data['DIR_RESOURCES'] = os.listdir( DIR_RESOURCES )

    return data

#def infrastructure_api_job_source():
#
#  data = OrderedDict()
#   data['count'] = 0
#   data['results'] = []
#   data['boxes'] = OrderedDict()
#   data['related'] = OrderedDict()
#   _directories = os.listdir( DIR_JOBS )
#   for _directory in _directories:
#       filepath =  "%s/%s/"  % ( DIR_JOBS, _directory )  
#       _files = [directory for directory in os.listdir( filepath ) if os.path.isfile(filepath+directory)]
#       data['count'] = data['count'] + len(_files)
#       for _file in _files:
#           voutput = from_yml_get_related( "%s/%s/%s"  % ( DIR_JOBS, _directory, _file ) )
#           data['results'].append(voutput['id'])
#           if voutput['id'] != 'form':
#               data['boxes'][voutput['id']] = OrderedDict()
#               data['boxes'][voutput['id']] = voutput
#   return data

def infrastructure_api_job_source():

    data = OrderedDict()
    _directories = os.listdir( DIR_JOBS )
    for _directory in _directories:
        data[_directory] = OrderedDict()
        filepath = "%s/%s/"  % ( DIR_JOBS, _directory ) 
        _files = [directory for directory in os.listdir( filepath ) if os.path.isfile(filepath+directory)]
        path = "%s/%s/" % (DIR_JOBS, _directory)
        _subdirectories = [directory for directory in os.listdir( path ) if os.path.isdir(path+directory)]
        for _subdirectory in _subdirectories:
			data[_directory][_subdirectory] = OrderedDict()
			_subfiles = os.listdir( "%s/%s/%s"  % ( DIR_JOBS, _directory, _subdirectory ) )
			data[_directory][_subdirectory]['count'] = len(_subfiles)
			data[_directory][_subdirectory]['results'] = []
			data[_directory][_subdirectory]['boxes'] = OrderedDict()
			data[_directory][_subdirectory]['related'] = OrderedDict()
			for _subfile in _subfiles:
				voutput = from_yml_get_related( "%s/%s/%s/%s"  % ( DIR_INFRASTRUCTURES, _directory, _subdirectory, _subfile ) )
#				data[_directory][_subdirectory]['results'].append(voutput['id'])
				if voutput['id'] != 'form' and voutput['id'] != None:
				        data[_directory][_subdirectory]['results'].append(voutput['id'])
					data[_directory][_subdirectory]['boxes'][voutput['id']] = OrderedDict()
					data[_directory][_subdirectory]['boxes'][voutput['id']] = voutput
					data[_directory][_subdirectory]['boxes'][voutput['id']]['boxid'] = _directory
					data[_directory][_subdirectory]['boxes'][voutput['id']]['subboxid'] = _subdirectory
					data[_directory][_subdirectory]['boxes'][voutput['id']]['category'] = "%s.%s" % (_directory, _subdirectory)

    return data

def from_yml_get_related(src_path):


    data_loaded = {}
    data = {}
    if os.path.isfile(src_path):
      data = yaml.load(open(src_path), Loader=yamlordereddictloader.Loader)
      data_loaded.update(data)
    data_loaded['id'] = wizard_slugify(data['name']) if data.get('name') != None else None
    return data_loaded




