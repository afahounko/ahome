# python
import copy
import json
import logging
import operator
import re
import six
import urllib
from collections import OrderedDict
from datetime import timedelta



# Django
from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import ObjectDoesNotExist, ValidationError as DjangoValidationError
from django.db import models
from django.utils.translation import ugettext_lazy as _
from django.utils.encoding import force_text
from django.utils.text import capfirst
from django.utils.timezone import now
from django.utils.functional import cached_property



from awx.main.utils import (
    get_type_for_model, get_model_for_type, timestamp_apiformat,
    camelcase_to_underscore, getattrd, parse_yaml_or_json,
    has_model_field_prefetched, extract_ansible_vars, encrypt_dict,
    prefetch_page_capabilities)





from awx.main.utils.filters import SmartFilter
from awx.main.redact import REPLACE_STR

from awx.main.validators import vars_validate_or_raise

from awx.conf.license import feature_enabled
from awx.api.versioning import reverse, get_request_version
from awx.api.fields import (BooleanNullField, CharNullField, ChoiceNullField,
                            VerbatimField, DeprecatedCredentialField)


# DRF

from rest_framework.exceptions import ValidationError, PermissionDenied
from rest_framework import fields
from rest_framework import serializers
from rest_framework import validators
from rest_framework.utils.serializer_helpers import ReturnList

from rest_framework import serializers
from awx.ipam.models import *


from awx.ipam.views import *
from awx.main.views import *
# from awx.api.urls import *

# AWX
# from awx.main.utils import encrypt_field, parse_yaml_or_json



DEFAULT_SUMMARY_FIELDS = ('id', 'name', 'description')# , 'created_by', 'modified_by')#, 'type')

EXCLUDE_SUMMARY_FIELDS = ('prefix',)# , 'created_by', 'modified_by')#, 'type')


# Keys are fields (foreign keys) where, if found on an instance, summary info
# should be added to the serialized data.  Values are a tuple of field names on
# the related object to include in the summary data (if the field is present on
# the related object).
SUMMARIZABLE_FK_FIELDS = {
    'datacenter': DEFAULT_SUMMARY_FIELDS,
    'vrf': DEFAULT_SUMMARY_FIELDS,
    'prefix': ('id', 'family', 'prefix', 'status', 'is_pool', ),
    'vlan': DEFAULT_SUMMARY_FIELDS + ('vid', ),
    'rir': DEFAULT_SUMMARY_FIELDS + ('registry', 'region', ),
    # 'application': ('id', 'name', 'client_id'),
    # 'team': DEFAULT_SUMMARY_FIELDS,
    # 'inventory': DEFAULT_SUMMARY_FIELDS + ('has_active_failures',
    #                                        'total_hosts',
    #                                        'hosts_with_active_failures',
    #                                        'total_groups',
    #                                        'groups_with_active_failures',
    #                                        'has_inventory_sources',
    #                                        'total_inventory_sources',
    #                                        'inventory_sources_with_failures',
    #                                        'organization_id',
    #                                        'kind',
    #                                        'insights_credential_id',),
    # 'host': DEFAULT_SUMMARY_FIELDS + ('has_active_failures',
    #                                   'has_inventory_sources'),
    # 'group': DEFAULT_SUMMARY_FIELDS + ('has_active_failures',
    #                                    'total_hosts',
    #                                    'hosts_with_active_failures',
    #                                    'total_groups',
    #                                    'groups_with_active_failures',
    #                                    'has_inventory_sources'),
    # 'project': DEFAULT_SUMMARY_FIELDS + ('status', 'scm_type'),
    # 'source_project': DEFAULT_SUMMARY_FIELDS + ('status', 'scm_type'),
    # 'project_update': DEFAULT_SUMMARY_FIELDS + ('status', 'failed',),
    # 'credential': DEFAULT_SUMMARY_FIELDS + ('kind', 'cloud', 'credential_type_id'),
    # 'vault_credential': DEFAULT_SUMMARY_FIELDS + ('kind', 'cloud', 'credential_type_id'),
    # 'job': DEFAULT_SUMMARY_FIELDS + ('status', 'failed', 'elapsed'),
    # 'job_template': DEFAULT_SUMMARY_FIELDS,
    # 'workflow_job_template': DEFAULT_SUMMARY_FIELDS,
    # 'workflow_job': DEFAULT_SUMMARY_FIELDS,
    # 'schedule': DEFAULT_SUMMARY_FIELDS + ('next_run',),
    # 'unified_job_template': DEFAULT_SUMMARY_FIELDS + ('unified_job_type',),
    # 'last_job': DEFAULT_SUMMARY_FIELDS + ('finished', 'status', 'failed', 'license_error'),
    # 'last_job_host_summary': DEFAULT_SUMMARY_FIELDS + ('failed',),
    # 'last_update': DEFAULT_SUMMARY_FIELDS + ('status', 'failed', 'license_error'),
    # 'current_update': DEFAULT_SUMMARY_FIELDS + ('status', 'failed', 'license_error'),
    # 'current_job': DEFAULT_SUMMARY_FIELDS + ('status', 'failed', 'license_error'),
    # 'inventory_source': ('source', 'last_updated', 'status'),
    # 'custom_inventory_script': DEFAULT_SUMMARY_FIELDS,
    # 'source_script': ('name', 'description'),
    # 'role': ('id', 'role_field'),
    # 'notification_template': DEFAULT_SUMMARY_FIELDS,
    # 'instance_group': {'id', 'name', 'controller_id'},
    # 'insights_credential': DEFAULT_SUMMARY_FIELDS,
}






def reverse_gfk(content_object, request):
    '''
    Computes a reverse for a GenericForeignKey field.

    Returns a dictionary of the form
        { '<type>': reverse(<type detail>) }
    for example
        { 'organization': '/api/v1/organizations/1/' }
    '''
    if content_object is None or not hasattr(content_object, 'get_absolute_url'):
        return {}

    return {
        camelcase_to_underscore(content_object.__class__.__name__): content_object.get_absolute_url(request=request)
    }




class DynamicFieldsModelSerializer(serializers.ModelSerializer):
    """
    A ModelSerializer that takes an additional `fields` argument that
    controls which fields should be displayed.
    """

    def __init__(self, *args, **kwargs):
        # Don't pass the 'fields' arg up to the superclass
        fields = kwargs.pop('fields', None)

        # Instantiate the superclass normally
        super(DynamicFieldsModelSerializer, self).__init__(*args, **kwargs)

        if fields is not None:
            # Drop any fields that are not specified in the `fields` argument.
            allowed = set(fields)
            existing = set(self.fields)
            # for field_name in existing - allowed:
            for field_name in existing:
                self.fields.pop(field_name)

            if 'id' not in self.fields:
                self.fields.pop('id')






class BaseSerializerMetaclass(serializers.SerializerMetaclass):
    '''
    Custom metaclass to enable attribute inheritance from Meta objects on
    serializer base classes.

    Also allows for inheriting or updating field lists from base class(es):

        class Meta:

            # Inherit all fields from base class.
            fields = ('*',)

            # Inherit all fields from base class and add 'foo'.
            fields = ('*', 'foo')

            # Inherit all fields from base class except 'bar'.
            fields = ('*', '-bar')

            # Define fields as 'foo' and 'bar'; ignore base class fields.
            fields = ('foo', 'bar')

            # Extra field kwargs dicts are also merged from base classes.
            extra_kwargs = {
                'foo': {'required': True},
                'bar': {'read_only': True},
            }

            # If a subclass were to define extra_kwargs as:
            extra_kwargs = {
                'foo': {'required': False, 'default': ''},
                'bar': {'label': 'New Label for Bar'},
            }

            # The resulting value of extra_kwargs would be:
            extra_kwargs = {
                'foo': {'required': False, 'default': ''},
                'bar': {'read_only': True, 'label': 'New Label for Bar'},
            }

            # Extra field kwargs cannot be removed in subclasses, only replaced.

    '''

    @staticmethod
    def _is_list_of_strings(x):
        return isinstance(x, (list, tuple)) and all([isinstance(y, basestring) for y in x])

    @staticmethod
    def _is_extra_kwargs(x):
        return isinstance(x, dict) and all([isinstance(k, basestring) and isinstance(v, dict) for k,v in x.items()])

    @classmethod
    def _update_meta(cls, base, meta, other=None):
        for attr in dir(other):
            if attr.startswith('_'):
                continue
            val = getattr(other, attr)
            meta_val = getattr(meta, attr, None)
            # Special handling for lists/tuples of strings (field names).
            if cls._is_list_of_strings(val) and cls._is_list_of_strings(meta_val or []):
                meta_val = meta_val or []
                new_vals = []
                except_vals = []
                if base: # Merge values from all bases.
                    new_vals.extend([x for x in meta_val])
                for v in val:
                    if not base and v == '*': # Inherit all values from previous base(es).
                        new_vals.extend([x for x in meta_val])
                    elif not base and v.startswith('-'): # Except these values.
                        except_vals.append(v[1:])
                    else:
                        new_vals.append(v)
                val = []
                for v in new_vals:
                    if v not in except_vals and v not in val:
                        val.append(v)
                val = tuple(val)
            # Merge extra_kwargs dicts from base classes.
            elif cls._is_extra_kwargs(val) and cls._is_extra_kwargs(meta_val or {}):
                meta_val = meta_val or {}
                new_val = {}
                if base:
                    for k,v in meta_val.items():
                        new_val[k] = copy.deepcopy(v)
                for k,v in val.items():
                    new_val.setdefault(k, {}).update(copy.deepcopy(v))
                val = new_val
            # Any other values are copied in case they are mutable objects.
            else:
                val = copy.deepcopy(val)
            setattr(meta, attr, val)

    def __new__(cls, name, bases, attrs):
        meta = type('Meta', (object,), {})
        for base in bases[::-1]:
            cls._update_meta(base, meta, getattr(base, 'Meta', None))
        cls._update_meta(None, meta, attrs.get('Meta', meta))
        attrs['Meta'] = meta
        return super(BaseSerializerMetaclass, cls).__new__(cls, name, bases, attrs)


class BaseSerializer(serializers.ModelSerializer):

    __metaclass__ = BaseSerializerMetaclass

    class Meta:
        fields = ('id', 'type', 'url', 'summary_fields',
                  'name', 'description')
        summary_fields = ()
        summarizable_fields = ()

    # add the URL and related resources
    type           = serializers.SerializerMethodField()
    url            = serializers.CharField(source='get_absolute_url', read_only=True)
    # url            = serializers.SerializerMethodField()
    # related        = serializers.SerializerMethodField()
    summary_fields = serializers.SerializerMethodField('_get_summary_fields', read_only=True)

    # make certain fields read only
    # created       = serializers.SerializerMethodField()
    # modified      = serializers.SerializerMethodField()


    def get_type(self, obj):
        return get_type_for_model(self.Meta.model)

    def get_url(self, obj):
        if obj is None or not hasattr(obj, 'get_absolute_url'):
            return ''
        elif isinstance(obj, User):
            return self.reverse('api:user_detail', kwargs={'pk': obj.pk})
        else:
            return obj.get_absolute_url(request=self.context.get('request'))


    def _get_summary_fields(self, obj):
        return {} if obj is None else self.get_summary_fields(obj)


    def get_summary_fields(self, obj):
        # code here to calculate the result
        # or return obj.calc_result() if you have that calculation in the model
        # datacenter_name = serializers.ReadOnlyField(source='datacenter.name',)
        # return "some result"

        summary_fields = OrderedDict()

        # fk = 'datacenter'
        # fields = ['id', 'name']
        
        # summary_fields[fk] = OrderedDict()
        
        # fkval = getattr(obj, fk, None)

        # for field in fields:
        #     fval = getattr(fkval, field, None)
        #     summary_fields[fk][field] = fval

        all_field_names = list(set(self.fields.keys()) - set(EXCLUDE_SUMMARY_FIELDS))
        summary_field_keys = list(SUMMARIZABLE_FK_FIELDS.keys())

        # summary_fields['all_fields'] =  all_field_names
        # summary_fields['summary_field_keys'] =  summary_field_keys
        # summary_fields['diff'] =  list(set(all_field_names) & set(summary_field_keys))

        field_names = list(set(all_field_names) & set(summary_field_keys))

        for fk in field_names:
            summary_fields[fk] = OrderedDict()
            fields = SUMMARIZABLE_FK_FIELDS[fk]
            fkval = getattr(obj, fk, None)

            for field in fields:
                fval = getattr(fkval, field, None)
                summary_fields[fk][field] = fval


        # Status
        fk = 'status'
        if fk in all_field_names:
            # fk = 'status'
            ftype_model = get_type_for_model(self.Meta.model)

            if ftype_model == 'prefix':
                STATUS_CHOICES = copy.deepcopy(STATUS_PREFIX_SUMMARY)
            elif ftype_model == 'ip_address':
                STATUS_CHOICES = copy.deepcopy(STATUS_IPADDRESS_SUMMARY)
            else:
                STATUS_CHOICES = copy.deepcopy(STATUS_PREFIX_SUMMARY)

            summary_fields[fk] = OrderedDict()
            fkval = getattr(obj, fk, None)

            fval = STATUS_CHOICES[fkval]

            fields = OrderedDict()
            fields['id'] = fkval
            fields['name'] = fval
            fields['type'] = ftype_model
            fields['debug'] = fkval #STATUS_CHOICES[fkval]

            
            summary_fields[fk] = fields



        return summary_fields


    def _get_related_fields(self, obj):
        return {} if obj is None else self.get_related_fields(obj)


    def get_related_fields(self, obj):
        # code here to calculate the result
        # or return obj.calc_result() if you have that calculation in the model
        # datacenter_name = serializers.ReadOnlyField(source='datacenter.name',)
        # return "some result"
        related_fields = OrderedDict()
        try:
            opts_fields = parse_yaml_or_json( getattr(obj, 'opts', None) )
        except Exception as e:
            # raise e
            opts_fields = OrderedDict()
            pass
        related_fields['opts'] = opts_fields

        return related_fields
        




# Serializers define the API representation.
class IpamRirSerializer(BaseSerializer):
    class Meta:
        model = Rir
        fields = '__all__'
        # fields = ('*','-description')

    # def get_summary_fields(self, obj):
    #     summary_fields = super(IpamRirSerializer, self).get_summary_fields(obj)
    #     summary_fields = {}
    #     return summary_fields




class IpamVrfSerializer(BaseSerializer):
    
    # url = serializers.HyperlinkedIdentityField(view_name='vrfs', lookup_field='slug')
    # datacenter_name = serializers.RelatedField(source='datacenter', read_only=True)
    # owner = serializers.ReadOnlyField(source='owner.username')

    # datacenter_name = serializers.ReadOnlyField(source='datacenter.name',)

    summary_fields = serializers.SerializerMethodField()

    class Meta:
        model = Vrf
        fields = '__all__'
        # fields = ('url', 'name', 'description', 'rd', 'enforce_unique')
        # read_only_fields = ('datacenter_name',)


        

class IpamDatacenterSerializer(BaseSerializer):

    # providers = serializers.RelatedField(many=True,read_only=True)

    class Meta:
        model = Datacenter
        fields = '__all__'
        # fields = ('name', 'description', 
        #   'site', 'location', 'facility', 'physical_address', 
        #   'shipping_address', 'contact_name', 'contact_phone', 
        #   'contact_email', 'comments'
        #   )

    # def get_summary_fields(self, obj):
    #     summary_fields = super(IpamDatacenterSerializer, self).get_summary_fields(obj)
    #     # summary_fields['datacenter'] = {}
    #     summary_fields = {}
    #     return summary_fields




class IpamAggregateSerializer(BaseSerializer):
    class Meta:
        model = Aggregate
        fields = '__all__'
        # fields = ( 'family', 'rir', 'date_added', 'description',
        #   )


class IpamPrefixSerializer(BaseSerializer):
    class Meta:
        model = Prefix
        fields = '__all__'
        # fields = ('prefix', 'description', 
        #   'vrf', 'family', 'datacenter', 'vrf', 'is_pool',
        #   )

    # def get_summary_fields1(self, obj):
    #     summary_fields = super(IpamPrefixSerializer, self).get_summary_fields(obj)
    #     # summary_fields['datacenter'] = {}







    #     all_field_names = self.fields.keys()
    #     summary_field_keys = list(SUMMARIZABLE_FK_FIELDS.keys())

    #     # summary_fields['all_fields'] =  all_field_names
    #     # summary_fields['summary_field_keys'] =  summary_field_keys
    #     # summary_fields['diff'] =  list(set(all_field_names) & set(summary_field_keys))

    #     field_names = list(set(all_field_names) & set(summary_field_keys))

    #     for fk in field_names:
    #         summary_fields[fk] = OrderedDict()
    #         fields = SUMMARIZABLE_FK_FIELDS[fk]
    #         fkval = getattr(obj, fk, None)

    #         for field in fields:
    #             fval = getattr(fkval, field, None)
    #             summary_fields[fk][field] = fval

    #     # if field_names:
    #     #     summary_fields['danny'] =  field_names

    #     return summary_fields


class IpamIPAddressSerializer(BaseSerializer):
    class Meta:
        model = IPAddress
        fields = '__all__'
        # fields = ('address', 'description', 
        #   'vrf', 'family', 'datacenter', 'status',
        #   )



class IpamVlanSerializer(BaseSerializer):
    class Meta:
        model = Vlan
        fields = '__all__'
        # fields = ('name', 'description', 
        #   'vid', 'status',
        #   )




class IpamProviderSerializer(BaseSerializer):

    # artifacts = serializers.JSONField(default={})
    # opts = serializers.JSONField(default={})
    # hosts = serializers.JSONField(default={})
    # svc_enabled = serializers.JSONField(default={})
    # requirements = serializers.JSONField(default={})
    # security = serializers.JSONField(default={})



    # url = serializers.CharField(source='get_absolute_url', read_only=True)
    # groups = serializers.PrimaryKeyRelatedField(many=True)
    # datacenter = serializers.HyperlinkedRelatedField(queryset=Datacenter.objects.all())
    # datacenter = serializers.HyperlinkedRelatedField(view_name='ipam_provider-list', lookup_field='providers', read_only=True)
    # datacenters = serializers.RelatedField(many=True,read_only=True)

    related = serializers.SerializerMethodField('_get_related_fields', read_only=True)

    # opts = serializers.JSONField(source='Provider.opts')

    class Meta:
        model = Provider
        fields = '__all__'
        # fields = ('id', 'name', 'description', 
        #   'url', 'token', 'username', 'password', 'hosts', 'artifacts', 
        #   'scm_type', 'scm_url', 'scm_branch', 'scm_revision', 'svc_enabled', 'security', 
        #   'requirements', 'opts', 'source', 'credential', 'datacenter',
        #   )
    def to_representation(self, instance):
        data = super(IpamProviderSerializer, self).to_representation(instance)
        # data.update(...)
        # data['opts_data'] = parse_yaml_or_json( getattr(instance, 'opts', None) )
        data['opts'] = parse_yaml_or_json( getattr(instance, 'opts', None) )
        data['hosts'] = parse_yaml_or_json( getattr(instance, 'hosts', None) )
        data['artifacts'] = parse_yaml_or_json( getattr(instance, 'artifacts', None) )
        data['security'] = parse_yaml_or_json( getattr(instance, 'security', None) )
        data['requirements'] = parse_yaml_or_json( getattr(instance, 'requirements', None) )
        data['svc_enabled'] = parse_yaml_or_json( getattr(instance, 'svc_enabled', None) )
        return data





# Storage
class IpamStorageSerializer(BaseSerializer):

    # artifacts = serializers.JSONField(default={})
    # opts = serializers.JSONField(default={})
    # hosts = serializers.JSONField(default={})
    # svc_enabled = serializers.JSONField(default={})
    # requirements = serializers.JSONField(default={})
    # security = serializers.JSONField(default={})

    related = serializers.SerializerMethodField('_get_related_fields', read_only=True)

    class Meta:
        model = Storage
        fields = '__all__'

    def to_representation(self, instance):
        data = super(IpamStorageSerializer, self).to_representation(instance)
        data['opts'] = parse_yaml_or_json( getattr(instance, 'opts', None) )
        data['hosts'] = parse_yaml_or_json( getattr(instance, 'hosts', None) )
        data['artifacts'] = parse_yaml_or_json( getattr(instance, 'artifacts', None) )
        data['security'] = parse_yaml_or_json( getattr(instance, 'security', None) )
        data['requirements'] = parse_yaml_or_json( getattr(instance, 'requirements', None) )
        data['svc_enabled'] = parse_yaml_or_json( getattr(instance, 'svc_enabled', None) )
        return data





# Service
class IpamServiceSerializer(BaseSerializer):

    # artifacts = serializers.JSONField(default={})
    # opts = serializers.JSONField(default={})
    # hosts = serializers.JSONField(default={})
    # svc_enabled = serializers.JSONField(default={})
    # requirements = serializers.JSONField(default={})
    # security = serializers.JSONField(default={})

    class Meta:
        model = Service
        fields = '__all__'

    def to_representation(self, instance):
        data = super(IpamServiceSerializer, self).to_representation(instance)
        data['opts'] = parse_yaml_or_json( getattr(instance, 'opts', None) )
        data['hosts'] = parse_yaml_or_json( getattr(instance, 'hosts', None) )
        data['artifacts'] = parse_yaml_or_json( getattr(instance, 'artifacts', None) )
        data['security'] = parse_yaml_or_json( getattr(instance, 'security', None) )
        data['requirements'] = parse_yaml_or_json( getattr(instance, 'requirements', None) )
        data['svc_enabled'] = parse_yaml_or_json( getattr(instance, 'svc_enabled', None) )
        return data




# Network
class IpamNetworkSerializer(BaseSerializer):

    # artifacts = serializers.JSONField(default={})
    # opts = serializers.JSONField(default={})
    # hosts = serializers.JSONField(default={})
    # svc_enabled = serializers.JSONField(default={})
    # requirements = serializers.JSONField(default={})
    # security = serializers.JSONField(default={})

    related = serializers.SerializerMethodField('_get_related_fields', read_only=True)

    class Meta:
        model = Network
        fields = '__all__'


    def to_representation(self, instance):
        data = super(IpamNetworkSerializer, self).to_representation(instance)
        data['opts'] = parse_yaml_or_json( getattr(instance, 'opts', None) )
        data['hosts'] = parse_yaml_or_json( getattr(instance, 'hosts', None) )
        data['artifacts'] = parse_yaml_or_json( getattr(instance, 'artifacts', None) )
        data['security'] = parse_yaml_or_json( getattr(instance, 'security', None) )
        data['requirements'] = parse_yaml_or_json( getattr(instance, 'requirements', None) )
        data['svc_enabled'] = parse_yaml_or_json( getattr(instance, 'svc_enabled', None) )
        return data




# App
class IpamAppSerializer(BaseSerializer):

    # artifacts = serializers.JSONField(default={})
    # opts = serializers.JSONField(default={})
    # hosts = serializers.JSONField(default={})
    # svc_enabled = serializers.JSONField(default={})
    # requirements = serializers.JSONField(default={})
    # security = serializers.JSONField(default={})

    related = serializers.SerializerMethodField('_get_related_fields', read_only=True)

    class Meta:
        model = App
        fields = '__all__'

    def to_representation(self, instance):
        data = super(IpamAppSerializer, self).to_representation(instance)
        data['opts'] = parse_yaml_or_json( getattr(instance, 'opts', None) )
        data['hosts'] = parse_yaml_or_json( getattr(instance, 'hosts', None) )
        data['artifacts'] = parse_yaml_or_json( getattr(instance, 'artifacts', None) )
        data['security'] = parse_yaml_or_json( getattr(instance, 'security', None) )
        data['requirements'] = parse_yaml_or_json( getattr(instance, 'requirements', None) )
        data['svc_enabled'] = parse_yaml_or_json( getattr(instance, 'svc_enabled', None) )
        return data




# Noc
class IpamNocSerializer(BaseSerializer):

    # artifacts = serializers.JSONField(default={})
    # opts = serializers.JSONField(default={})
    # hosts = serializers.JSONField(default={})
    # svc_enabled = serializers.JSONField(default={})
    # requirements = serializers.JSONField(default={})
    # security = serializers.JSONField(default={})

    related = serializers.SerializerMethodField('_get_related_fields', read_only=True)

    class Meta:
        model = Noc
        fields = '__all__'

    def to_representation(self, instance):
        data = super(IpamNocSerializer, self).to_representation(instance)
        data['opts'] = parse_yaml_or_json( getattr(instance, 'opts', None) )
        data['hosts'] = parse_yaml_or_json( getattr(instance, 'hosts', None) )
        data['artifacts'] = parse_yaml_or_json( getattr(instance, 'artifacts', None) )
        data['security'] = parse_yaml_or_json( getattr(instance, 'security', None) )
        data['requirements'] = parse_yaml_or_json( getattr(instance, 'requirements', None) )
        data['svc_enabled'] = parse_yaml_or_json( getattr(instance, 'svc_enabled', None) )
        return data



# Backup
class IpamBackupSerializer(BaseSerializer):

    # artifacts = serializers.JSONField(default={})
    # opts = serializers.JSONField(default={})
    # hosts = serializers.JSONField(default={})
    # svc_enabled = serializers.JSONField(default={})
    # requirements = serializers.JSONField(default={})
    # security = serializers.JSONField(default={})

    related = serializers.SerializerMethodField('_get_related_fields', read_only=True)

    class Meta:
        model = Backup
        fields = '__all__'


    def to_representation(self, instance):
        data = super(IpamBackupSerializer, self).to_representation(instance)
        data['opts'] = parse_yaml_or_json( getattr(instance, 'opts', None) )
        data['hosts'] = parse_yaml_or_json( getattr(instance, 'hosts', None) )
        data['artifacts'] = parse_yaml_or_json( getattr(instance, 'artifacts', None) )
        data['security'] = parse_yaml_or_json( getattr(instance, 'security', None) )
        data['requirements'] = parse_yaml_or_json( getattr(instance, 'requirements', None) )
        data['svc_enabled'] = parse_yaml_or_json( getattr(instance, 'svc_enabled', None) )
        return data



# Documentation
class IpamDocumentationSerializer(BaseSerializer):

    # artifacts = serializers.JSONField(default={})
    # opts = serializers.JSONField(default={})
    # hosts = serializers.JSONField(default={})
    # svc_enabled = serializers.JSONField(default={})
    # requirements = serializers.JSONField(default={})
    # security = serializers.JSONField(default={})

    related = serializers.SerializerMethodField('_get_related_fields', read_only=True)

    class Meta:
        model = Documentation
        fields = '__all__'

    def to_representation(self, instance):
        data = super(IpamDocumentationSerializer, self).to_representation(instance)
        data['opts'] = parse_yaml_or_json( getattr(instance, 'opts', None) )
        data['hosts'] = parse_yaml_or_json( getattr(instance, 'hosts', None) )
        data['artifacts'] = parse_yaml_or_json( getattr(instance, 'artifacts', None) )
        data['security'] = parse_yaml_or_json( getattr(instance, 'security', None) )
        data['requirements'] = parse_yaml_or_json( getattr(instance, 'requirements', None) )
        data['svc_enabled'] = parse_yaml_or_json( getattr(instance, 'svc_enabled', None) )
        return data



# PKI
class IpamPkiSerializer(BaseSerializer):

    # artifacts = serializers.JSONField(default={})
    # opts = serializers.JSONField(default={})
    # hosts = serializers.JSONField(default={})
    # svc_enabled = serializers.JSONField(default={})
    # requirements = serializers.JSONField(default={})
    # security = serializers.JSONField(default={})

    related = serializers.SerializerMethodField('_get_related_fields', read_only=True)

    class Meta:
        model = Pki
        fields = '__all__'

    def to_representation(self, instance):
        data = super(IpamPkiSerializer, self).to_representation(instance)
        data['opts'] = parse_yaml_or_json( getattr(instance, 'opts', None) )
        data['hosts'] = parse_yaml_or_json( getattr(instance, 'hosts', None) )
        data['artifacts'] = parse_yaml_or_json( getattr(instance, 'artifacts', None) )
        data['security'] = parse_yaml_or_json( getattr(instance, 'security', None) )
        data['requirements'] = parse_yaml_or_json( getattr(instance, 'requirements', None) )
        data['svc_enabled'] = parse_yaml_or_json( getattr(instance, 'svc_enabled', None) )
        return data




# Security
class IpamSecuritySerializer(BaseSerializer):

    # artifacts = serializers.JSONField(default={})
    # opts = serializers.JSONField(default={})
    # hosts = serializers.JSONField(default={})
    # svc_enabled = serializers.JSONField(default={})
    # requirements = serializers.JSONField(default={})
    # security = serializers.JSONField(default={})

    related = serializers.SerializerMethodField('_get_related_fields', read_only=True)

    class Meta:
        model = Security
        fields = '__all__'


    def to_representation(self, instance):
        data = super(IpamSecuritySerializer, self).to_representation(instance)
        data['opts'] = parse_yaml_or_json( getattr(instance, 'opts', None) )
        data['hosts'] = parse_yaml_or_json( getattr(instance, 'hosts', None) )
        data['artifacts'] = parse_yaml_or_json( getattr(instance, 'artifacts', None) )
        data['security'] = parse_yaml_or_json( getattr(instance, 'security', None) )
        data['requirements'] = parse_yaml_or_json( getattr(instance, 'requirements', None) )
        data['svc_enabled'] = parse_yaml_or_json( getattr(instance, 'svc_enabled', None) )
        return data



# Monitoring
class IpamMonitoringSerializer(BaseSerializer):


    related = serializers.SerializerMethodField('_get_related_fields', read_only=True)

    class Meta:
        model = Monitoring
        fields = '__all__'


    def to_representation(self, instance):
        data = super(IpamMonitoringSerializer, self).to_representation(instance)
        data['opts'] = parse_yaml_or_json( getattr(instance, 'opts', None) )
        data['hosts'] = parse_yaml_or_json( getattr(instance, 'hosts', None) )
        data['artifacts'] = parse_yaml_or_json( getattr(instance, 'artifacts', None) )
        data['security'] = parse_yaml_or_json( getattr(instance, 'security', None) )
        data['requirements'] = parse_yaml_or_json( getattr(instance, 'requirements', None) )
        data['svc_enabled'] = parse_yaml_or_json( getattr(instance, 'svc_enabled', None) )
        return data




# Infrastructure Job
class IpamInfrastructureJobSerializer(BaseSerializer):



    related = serializers.SerializerMethodField('_get_related_fields', read_only=True)

    class Meta:
        model = InfrastructureJob
        fields = '__all__'

    def to_representation(self, instance):
        data = super(IpamInfrastructureJobSerializer, self).to_representation(instance)
        data['opts'] = parse_yaml_or_json( getattr(instance, 'opts', None) )
        data['hosts'] = parse_yaml_or_json( getattr(instance, 'hosts', None) )
        data['artifacts'] = parse_yaml_or_json( getattr(instance, 'artifacts', None) )
        data['security'] = parse_yaml_or_json( getattr(instance, 'security', None) )
        data['requirements'] = parse_yaml_or_json( getattr(instance, 'requirements', None) )
        data['svc_enabled'] = parse_yaml_or_json( getattr(instance, 'svc_enabled', None) )
        return data




# BareMetal
class IpamBareMetalSerializer(BaseSerializer):

    # artifacts = serializers.JSONField(default={})
    # opts = serializers.JSONField(default={})
    # hosts = serializers.JSONField(default={})

    related = serializers.SerializerMethodField('_get_related_fields', read_only=True)


    class Meta:
        model = BareMetal
        fields = '__all__'


    def to_representation(self, instance):
        data = super(IpamBareMetalSerializer, self).to_representation(instance)
        data['opts'] = parse_yaml_or_json( getattr(instance, 'opts', None) )
        data['hosts'] = parse_yaml_or_json( getattr(instance, 'hosts', None) )
        data['artifacts'] = parse_yaml_or_json( getattr(instance, 'artifacts', None) )
        return data


# VirtualHost
class IpamVirtualHostSerializer(BaseSerializer):

    # artifacts = serializers.JSONField(default={})
    # opts = serializers.JSONField(default={})
    # hosts = serializers.JSONField(default={})

    related = serializers.SerializerMethodField('_get_related_fields', read_only=True)

    class Meta:
        model = VirtualHost
        fields = '__all__'


    def to_representation(self, instance):
        data = super(IpamVirtualHostSerializer, self).to_representation(instance)
        data['opts'] = parse_yaml_or_json( getattr(instance, 'opts', None) )
        data['hosts'] = parse_yaml_or_json( getattr(instance, 'hosts', None) )
        data['artifacts'] = parse_yaml_or_json( getattr(instance, 'artifacts', None) )
        return data



# NetworkGear
class IpamNetworkGearSerializer(BaseSerializer):

    # artifacts = serializers.JSONField(default={})
    # opts = serializers.JSONField(default={})
    # hosts = serializers.JSONField(default={})

    related = serializers.SerializerMethodField('_get_related_fields', read_only=True)

    class Meta:
        model = NetworkGear
        fields = '__all__'


    def to_representation(self, instance):
        data = super(IpamNetworkGearSerializer, self).to_representation(instance)
        data['opts'] = parse_yaml_or_json( getattr(instance, 'opts', None) )
        data['hosts'] = parse_yaml_or_json( getattr(instance, 'hosts', None) )
        data['artifacts'] = parse_yaml_or_json( getattr(instance, 'artifacts', None) )
        return data


    # def create(self, validated_data):
    #     return NetworkGear.objects.create(**validated_data)




# Registry
class IpamRegistrySerializer(BaseSerializer):

    related = serializers.SerializerMethodField('_get_related_fields', read_only=True)

    # artifacts = serializers.JSONField(default={})
    # opts = serializers.JSONField(default={})
    # hosts = serializers.JSONField(default={})

    class Meta:
        model = Registry
        fields = '__all__'



    def to_representation(self, instance):
        data = super(IpamRegistrySerializer, self).to_representation(instance)
        data['opts'] = parse_yaml_or_json( getattr(instance, 'opts', None) )
        data['hosts'] = parse_yaml_or_json( getattr(instance, 'hosts', None) )
        data['artifacts'] = parse_yaml_or_json( getattr(instance, 'artifacts', None) )
        return data









