from __future__ import unicode_literals
from django.utils.encoding import python_2_unicode_compatible
from awx.ipam.constants import *
from awx.ipam.fields import IPNetworkField, IPAddressField
from django.db import models

from django.contrib.contenttypes.fields import GenericRelation
from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db.models.expressions import RawSQL
# from django.urls import reverse

# AWX
from awx.api.versioning import reverse

# AWX
from awx.main.utils import encrypt_field, parse_yaml_or_json


from django.utils.translation import ugettext_lazy as _
#from awx.main.fields import JSONField, AskForField
from django.contrib.postgres.fields import JSONField



class VarsDictProperty(object):
    '''
    Retrieve a string of variables in YAML or JSON as a dictionary.
    '''

    def __init__(self, field='variables', key_value=False):
        self.field = field
        self.key_value = key_value

    def __get__(self, obj, type=None):
        if obj is None:
            return self
        v = getattr(obj, self.field)
        if hasattr(v, 'items'):
            return v
        v = v.encode('utf-8')
        return parse_yaml_or_json(v)

    def __set__(self, obj, value):
        raise AttributeError('readonly property')




class CreatedUpdatedModel(models.Model):
    created = models.DateField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


@python_2_unicode_compatible
class Rir(CreatedUpdatedModel):
    """
    RIR
    """ 
    name = models.CharField(max_length=50)
    description = models.CharField(max_length=200, blank=True, null=True)
    registry = models.CharField(max_length=200, blank=True, null=True, verbose_name='Internet Registry')
    region = models.CharField(max_length=200, blank=True, null=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'RIR'
        verbose_name_plural = 'RIRs'


    def __str__(self):
        return self.name


    def get_absolute_url(self, request=None):
        return reverse('api:ipam_rir-detail', kwargs={'pk': self.pk}, request=request)
        # return reverse('api:ipam_rir-list', request=request)




@python_2_unicode_compatible
class Vrf(CreatedUpdatedModel):
    """
    A virtual routing and forwarding (VRF) table represents a discrete layer three forwarding domain (e.g. a routing
    table). Prefixes and IPAddresses can optionally be assigned to VRFs. (Prefixes and IPAddresses not assigned to a VRF
    are said to exist in the "global" table.)
    """
    name = models.CharField(max_length=50)
    description = models.CharField(max_length=200, blank=True, null=True)
    rd = models.CharField(max_length=21, verbose_name='Route distinguisher')
    enforce_unique = models.BooleanField(default=True, verbose_name='Enforce unique space',
                                         help_text="Prevent duplicate prefixes/IP addresses within this VRF")
    datacenter = models.ForeignKey(
        'Datacenter', 
        related_name='vrfs', 
        on_delete=models.PROTECT, 
        blank=True, 
        null=True
    )

    class Meta:
        ordering = ['name']
        verbose_name = 'VRF'
        verbose_name_plural = 'VRFs'

    def __str__(self):
        return self.display_name or super(Vrf, self).__str__()

    @property
    def display_name(self):
        if self.name and self.rd:
            return "{} ({})".format(self.name, self.rd)
        return None

    def get_absolute_url(self, request=None):
        return reverse('api:ipam_vrf-detail', kwargs={'pk': self.pk}, request=request)



@python_2_unicode_compatible
class Datacenter(CreatedUpdatedModel):
    """
    Datacenter
    """ 
    name = models.CharField(max_length=50)
    description = models.CharField(max_length=200, blank=True)
    site = models.CharField(max_length=50, blank=True)
    location = models.CharField(max_length=50, blank=True)
    facility = models.CharField(max_length=50, blank=True)
    physical_address = models.CharField(max_length=200, blank=True)
    shipping_address = models.CharField(max_length=200, blank=True)
    contact_name = models.CharField(max_length=50, blank=True)
    contact_phone = models.CharField(max_length=20, blank=True)
    contact_email = models.EmailField(blank=True, verbose_name="Contact E-mail")
    comments = models.TextField(blank=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

    def get_absolute_url(self, request=None):
        return reverse('api:ipam_datacenter-detail', kwargs={'pk': self.pk}, request=request)




@python_2_unicode_compatible
class Aggregate(CreatedUpdatedModel):
    """
    An aggregate exists at the root level of the IP address space hierarchy in NetBox. Aggregates are used to organize
    the hierarchy and track the overall utilization of available address space. Each Aggregate is assigned to a RIR.
    """
    family = models.PositiveSmallIntegerField(choices=AF_CHOICES, editable=False)
    prefix = IPNetworkField()
    rir = models.ForeignKey('Rir', related_name='aggregates', on_delete=models.PROTECT, verbose_name='RIR')
    date_added = models.DateField(blank=True, null=True)
    description = models.CharField(max_length=100, blank=True)
    datacenter = models.ForeignKey(
        'Datacenter', 
        related_name='aggregates', 
        on_delete=models.PROTECT, 
        blank=True, 
        null=True
    )

    class Meta:
        ordering = ['family', 'prefix']

    def __str__(self):
        return str(self.prefix)

    def get_absolute_url(self, request=None):
        return reverse('api:ipam_aggregate-detail', kwargs={'pk': self.pk}, request=request)

    def clean(self):

        if self.prefix:

            # Clear host bits from prefix
            self.prefix = self.prefix.cidr

            # Ensure that the aggregate being added is not covered by an existing aggregate
            covering_aggregates = Aggregate.objects.filter(prefix__net_contains_or_equals=str(self.prefix))
            if self.pk:
                covering_aggregates = covering_aggregates.exclude(pk=self.pk)
            if covering_aggregates:
                raise ValidationError({
                    'prefix': "Aggregates cannot overlap. {} is already covered by an existing aggregate ({}).".format(
                        self.prefix, covering_aggregates[0]
                    )
                })

            # Ensure that the aggregate being added does not cover an existing aggregate
            covered_aggregates = Aggregate.objects.filter(prefix__net_contained=str(self.prefix))
            if self.pk:
                covered_aggregates = covered_aggregates.exclude(pk=self.pk)
            if covered_aggregates:
                raise ValidationError({
                    'prefix': "Aggregates cannot overlap. {} covers an existing aggregate ({}).".format(
                        self.prefix, covered_aggregates[0]
                    )
                })

    def save(self, *args, **kwargs):
        if self.prefix:
            # Infer address family from IPNetwork object
            self.family = self.prefix.version
        super(Aggregate, self).save(*args, **kwargs)


    def get_utilization(self):
        """
        Determine the prefix utilization of the aggregate and return it as a percentage.
        """
        queryset = Prefix.objects.filter(prefix__net_contained_or_equal=str(self.prefix))
        child_prefixes = netaddr.IPSet([p.prefix for p in queryset])
        return int(float(child_prefixes.size) / self.prefix.size * 100)





# @python_2_unicode_compatible
class Prefix(CreatedUpdatedModel):
    """
    A Prefix represents an IPv4 or IPv6 network, including mask length. Prefixes can optionally be assigned to Sites and
    VRFs. A Prefix must be assigned a status and may optionally be assigned a used-define Role. A Prefix can also be
    assigned to a VLAN where appropriate.
    """
    family = models.PositiveSmallIntegerField(choices=AF_CHOICES, editable=False)
    prefix = IPNetworkField(help_text="IPv4 or IPv6 network with mask")
    datacenter = models.ForeignKey('Datacenter', related_name='prefixes', on_delete=models.PROTECT, blank=True, null=True)
    vrf = models.ForeignKey('Vrf', related_name='prefixes', on_delete=models.PROTECT, blank=True, null=True,
                            verbose_name='VRF')
    vlan = models.ForeignKey('Vlan', related_name='prefixes', on_delete=models.PROTECT, blank=True, null=True,
                             verbose_name='VLAN')
    status = models.PositiveSmallIntegerField('Status', choices=PREFIX_STATUS_CHOICES, default=PREFIX_STATUS_ACTIVE,
                                              help_text="Operational status of this prefix")
    is_pool = models.BooleanField(verbose_name='Is a pool', default=False,
                                  help_text="All IP addresses within this prefix are considered usable")
    description = models.CharField(max_length=100, blank=True)


    class Meta:
        ordering = ['vrf', 'family', 'prefix']
        verbose_name_plural = 'prefixes'

    def __str__(self):
        return str(self.prefix)

    def get_absolute_url(self, request=None):
        return reverse('api:ipam_prefix-detail', kwargs={'pk': self.pk}, request=request) 



    def clean(self):

        if self.prefix:

            # Disallow host masks
            if self.prefix.version == 4 and self.prefix.prefixlen == 32:
                raise ValidationError({
                    'prefix': "Cannot create host addresses (/32) as prefixes. Create an IPv4 address instead."
                })
            elif self.prefix.version == 6 and self.prefix.prefixlen == 128:
                raise ValidationError({
                    'prefix': "Cannot create host addresses (/128) as prefixes. Create an IPv6 address instead."
                })

            # Enforce unique IP space (if applicable)
            if (self.vrf is None and settings.ENFORCE_GLOBAL_UNIQUE) or (self.vrf and self.vrf.enforce_unique):
                duplicate_prefixes = self.get_duplicates()
                if duplicate_prefixes:
                    raise ValidationError({
                        'prefix': "Duplicate prefix found in {}: {}".format(
                            "VRF {}".format(self.vrf) if self.vrf else "global table",
                            duplicate_prefixes.first(),
                        )
                    })

    def save(self, *args, **kwargs):
        if self.prefix:
            # Clear host bits from prefix
            self.prefix = self.prefix.cidr
            # Infer address family from IPNetwork object
            self.family = self.prefix.version
        super(Prefix, self).save(*args, **kwargs)



    def get_status_class(self):
        return STATUS_CHOICE_CLASSES[self.status]

    def get_duplicates(self):
        return Prefix.objects.filter(vrf=self.vrf, prefix=str(self.prefix)).exclude(pk=self.pk)

    def get_child_prefixes(self):
        """
        Return all Prefixes within this Prefix and VRF.
        """
        return Prefix.objects.filter(prefix__net_contained=str(self.prefix), vrf=self.vrf)

    def get_child_ips(self):
        """
        Return all IPAddresses within this Prefix and VRF.
        """
        return IPAddress.objects.filter(address__net_host_contained=str(self.prefix), vrf=self.vrf)

    def get_available_prefixes(self):
        """
        Return all available Prefixes within this prefix as an IPSet.
        """
        prefix = netaddr.IPSet(self.prefix)
        child_prefixes = netaddr.IPSet([child.prefix for child in self.get_child_prefixes()])
        available_prefixes = prefix - child_prefixes

        return available_prefixes

    def get_available_ips(self):
        """
        Return all available IPs within this prefix as an IPSet.
        """
        prefix = netaddr.IPSet(self.prefix)
        child_ips = netaddr.IPSet([ip.address.ip for ip in self.get_child_ips()])
        available_ips = prefix - child_ips

        # Remove unusable IPs from non-pool prefixes
        if not self.is_pool:
            available_ips -= netaddr.IPSet([
                netaddr.IPAddress(self.prefix.first),
                netaddr.IPAddress(self.prefix.last),
            ])

        return available_ips

    def get_first_available_prefix(self):
        """
        Return the first available child prefix within the prefix (or None).
        """
        available_prefixes = self.get_available_prefixes()
        if not available_prefixes:
            return None
        return available_prefixes.iter_cidrs()[0]

    def get_first_available_ip(self):
        """
        Return the first available IP within the prefix (or None).
        """
        available_ips = self.get_available_ips()
        if not available_ips:
            return None
        return '{}/{}'.format(next(available_ips.__iter__()), self.prefix.prefixlen)

    def get_utilization(self):
        """
        Determine the utilization of the prefix and return it as a percentage. For Prefixes with a status of
        "container", calculate utilization based on child prefixes. For all others, count child IP addresses.
        """
        if self.status == PREFIX_STATUS_CONTAINER:
            queryset = Prefix.objects.filter(prefix__net_contained=str(self.prefix), vrf=self.vrf)
            child_prefixes = netaddr.IPSet([p.prefix for p in queryset])
            return int(float(child_prefixes.size) / self.prefix.size * 100)
        else:
            child_count = self.get_child_ips().count()
            prefix_size = self.prefix.size
            if self.family == 4 and self.prefix.prefixlen < 31 and not self.is_pool:
                prefix_size -= 2
            return int(float(child_count) / prefix_size * 100)












class IPAddressManager(models.Manager):

    def get_queryset(self):
        """
        By default, PostgreSQL will order INETs with shorter (larger) prefix lengths ahead of those with longer
        (smaller) masks. This makes no sense when ordering IPs, which should be ordered solely by family and host
        address. We can use HOST() to extract just the host portion of the address (ignoring its mask), but we must
        then re-cast this value to INET() so that records will be ordered properly. We are essentially re-casting each
        IP address as a /32 or /128.
        """
        qs = super(IPAddressManager, self).get_queryset()
        return qs.annotate(host=RawSQL('INET(HOST(ipam_ipaddress.address))', [])).order_by('family', 'host')


@python_2_unicode_compatible
class IPAddress(CreatedUpdatedModel):
    """
    An IPAddress represents an individual IPv4 or IPv6 address and its mask. The mask length should match what is
    configured in the real world. (Typically, only loopback interfaces are configured with /32 or /128 masks.) Like
    Prefixes, IPAddresses can optionally be assigned to a VRF. An IPAddress can optionally be assigned to an Interface.
    Interfaces can have zero or more IPAddresses assigned to them.
    An IPAddress can also optionally point to a NAT inside IP, designating itself as a NAT outside IP. This is useful,
    for example, when mapping public addresses to private addresses. When an Interface has been assigned an IPAddress
    which has a NAT outside IP, that Interface's Device can use either the inside or outside IP as its primary IP.
    """
    datacenter = models.ForeignKey('Datacenter', related_name='ip_addresses', on_delete=models.PROTECT, blank=True, null=True)
    family = models.PositiveSmallIntegerField(choices=AF_CHOICES, editable=False)
    address = IPAddressField(help_text="IPv4 or IPv6 address (with mask)")
    vrf = models.ForeignKey('VRF', related_name='ip_addresses', on_delete=models.PROTECT, blank=True, null=True,
                            verbose_name='VRF')
    status = models.PositiveSmallIntegerField(
        'Status', choices=IPADDRESS_STATUS_CHOICES, default=IPADDRESS_STATUS_ACTIVE,
        help_text='The operational status of this IP'
    )

    description = models.CharField(max_length=100, blank=True)


    class Meta:
        ordering = ['family', 'address']
        verbose_name = 'IP address'
        verbose_name_plural = 'IP addresses'

    def __str__(self):
        return str(self.address)

    def get_absolute_url(self, request=None):
        return reverse('api:ipam_ip_address-detail', kwargs={'pk': self.pk}, request=request)



    def get_duplicates(self):
        return IPAddress.objects.filter(vrf=self.vrf, address__net_host=str(self.address.ip)).exclude(pk=self.pk)

    def clean(self):

        if self.address:

            # Enforce unique IP space (if applicable)
            if (self.vrf is None and settings.ENFORCE_GLOBAL_UNIQUE) or (self.vrf and self.vrf.enforce_unique):
                duplicate_ips = self.get_duplicates()
                if duplicate_ips:
                    raise ValidationError({
                        'address': "Duplicate IP address found in {}: {}".format(
                            "VRF {}".format(self.vrf) if self.vrf else "global table",
                            duplicate_ips.first(),
                        )
                    })

    def save(self, *args, **kwargs):
        if self.address:
            # Infer address family from IPAddress object
            self.family = self.address.version
        super(IPAddress, self).save(*args, **kwargs)






@python_2_unicode_compatible
class Vlan(CreatedUpdatedModel):
    """
    A VLAN is a distinct layer two forwarding domain identified by a 12-bit integer (1-4094). Each VLAN must be assigned
    to a Site, however VLAN IDs need not be unique within a Site. A VLAN may optionally be assigned to a VLANGroup,
    within which all VLAN IDs and names but be unique.
    Like Prefixes, each VLAN is assigned an operational status and optionally a user-defined Role. A VLAN can have zero
    or more Prefixes assigned to it.
    """
    datacenter = models.ForeignKey('Datacenter', related_name='vlans', on_delete=models.PROTECT, blank=True, null=True)
    vid = models.PositiveSmallIntegerField(verbose_name='ID', validators=[
        MinValueValidator(1),
        MaxValueValidator(4094)
    ])
    name = models.CharField(max_length=64)
    status = models.PositiveSmallIntegerField('Status', choices=VLAN_STATUS_CHOICES, default=1)
    description = models.CharField(max_length=100, blank=True)
 

    class Meta:
        ordering = ['datacenter', 'vid']
        verbose_name = 'VLAN'
        verbose_name_plural = 'VLANs'

    def __str__(self):
        return self.display_name or super(Vlan, self).__str__()


    @property
    def display_name(self):
        if self.vid and self.name:
            return "{} ({})".format(self.vid, self.name)
        return None

    def get_status_class(self):
        return STATUS_CHOICE_CLASSES[self.status]

    def get_absolute_url(self, request=None):
        return reverse('api:ipam_vlan-detail', kwargs={'pk': self.pk}, request=request)




# @python_2_unicode_compatible
class InfrastructureTemplate(CreatedUpdatedModel):
    """
    Template for all infrastructure
    """
    class Meta:
        abstract = True

    name = models.CharField(max_length=100, blank=True)
    description = models.CharField(max_length=100, blank=True)
    url = models.CharField(max_length=200, blank=True)
    token = models.CharField(max_length=200, blank=True)
    username = models.CharField(max_length=200, blank=True)
    password = models.CharField(max_length=200, blank=True)
    hosts = JSONField(
        blank=True,
        default={},
        editable=True,
        null=True,
    )
    artifacts = JSONField(
        blank=True,
        default={},
        editable=True,
        null=True,
    )
    scm_type = models.CharField(
        max_length=8,
        choices=SCM_TYPE_CHOICES,
        blank=True,
        default='',
        verbose_name=_('SCM Type'),
        help_text=_("Specifies the source control system used to store the project."),
    )
    scm_url = models.CharField(
        max_length=1024,
        blank=True,
        default='',
        editable=False,
        verbose_name=_('SCM Source'),
        help_text=_('The SCM Source'),
    )
    scm_branch = models.CharField(
        max_length=1024,
        blank=True,
        default='',
        editable=False,
        verbose_name=_('SCM Branch'),
        help_text=_('The SCM Branch'),
    )
    scm_revision = models.CharField(
        max_length=1024,
        blank=True,
        default='',
        editable=False,
        verbose_name=_('SCM Revision'),
        help_text=_('The SCM Revision'),
    )
    credential = models.ForeignKey(
        'main.Credential',
        related_name='%(class)ss',
        blank=True,
        null=True,
        default=None,
        on_delete=models.SET_NULL,
    )
    datacenter = models.ForeignKey(
        'Datacenter', 
        related_name='%(class)ss',
        on_delete=models.PROTECT, 
        blank=True, 
        null=True
    )
    svc_enabled = JSONField(
        blank=True,
        default={},
        editable=True,
        null=True,
    )
    security = JSONField(
        blank=True,
        default={},
        editable=True,
        null=True,
    )
    requirements = JSONField(
        blank=True,
        default={},
        editable=True,
        null=True,
    )
    opts = JSONField(
        blank=True,
        default={},
        editable=True,
        null=True,
    )


    # opts

    opts_dict = VarsDictProperty('opts')


    def save(self, *args, **kwargs):
        if self.opts:
            # format to json before saving object
            self.opts = self.opts_dict
        super(InfrastructureTemplate, self).save(*args, **kwargs)





class Provider(InfrastructureTemplate):
    """
    Provider
    """
    source = models.CharField(max_length=20, choices=PROVIDER_CHOICES, default=PROVIDER_DEFAULT, editable=True)

    class Meta:
        ordering = ['name',]

    def __str__(self):
        return str(self.name)

    def get_absolute_url(self, request=None):
        return reverse('api:ipam_provider-detail', kwargs={'pk': self.pk}, request=request)


class Storage(InfrastructureTemplate):
    """
    Storage
    """
    source = models.CharField(max_length=20, choices=STORAGE_CHOICES, default=STORAGE_DEFAULT, editable=True)

    path = models.CharField(max_length=100, blank=True)

    class Meta:
        ordering = ['name',]

    def __str__(self):
        return str(self.name)

    def get_absolute_url(self, request=None):
        return reverse('api:ipam_storage-detail', kwargs={'pk': self.pk}, request=request)



class Service(InfrastructureTemplate):
    """
    Service
    """
    source = models.CharField(max_length=20, choices=SERVICE_CHOICES, default=SERVICE_DEFAULT, editable=True)

    class Meta:
        ordering = ['name',]

    def __str__(self):
        return str(self.name)

    def get_absolute_url(self, request=None):
        return reverse('api:ipam_service-detail', kwargs={'pk': self.pk}, request=request)


class Network(InfrastructureTemplate):
    """
    Service
    """
    source = models.CharField(max_length=20, choices=NETWORK_CHOICES, default=NETWORK_DEFAULT, editable=True)

    class Meta:
        ordering = ['name',]

    def __str__(self):
        return str(self.name)

    def get_absolute_url(self, request=None):
        return reverse('api:ipam_network-detail', kwargs={'pk': self.pk}, request=request)



class App(InfrastructureTemplate):
    """
    Application
    """
    source = models.CharField(max_length=20, choices=APP_CHOICES, default=APP_DEFAULT, editable=True)

    class Meta:
        ordering = ['name',]

    def __str__(self):
        return str(self.name)


    def get_absolute_url(self, request=None):
        return reverse('api:ipam_app-detail', kwargs={'pk': self.pk}, request=request)



class Noc(InfrastructureTemplate):
    """
    Network Operation Center
    """
    source = models.CharField(max_length=20, choices=NOC_CHOICES, default=NOC_DEFAULT, editable=True)

    class Meta:
        ordering = ['name',]

    def __str__(self):
        return str(self.name)


    def get_absolute_url(self, request=None):
        return reverse('api:ipam_noc-detail', kwargs={'pk': self.pk}, request=request)



class Backup(InfrastructureTemplate):
    """
    Backup
    """
    source = models.CharField(max_length=20, choices=BACKUP_CHOICES, default=BACKUP_DEFAULT, editable=True)

    class Meta:
        ordering = ['name',]

    def __str__(self):
        return str(self.name)


    def get_absolute_url(self, request=None):
        return reverse('api:ipam_backup-detail', kwargs={'pk': self.pk}, request=request)



class Documentation(InfrastructureTemplate):
    """
    Documentation
    """
    source = models.CharField(max_length=20, choices=DOCUMENTATION_CHOICES, default=DOCUMENTATION_DEFAULT, editable=True)

    class Meta:
        ordering = ['name',]

    def __str__(self):
        return str(self.name)


    def get_absolute_url(self, request=None):
        return reverse('api:ipam_documentation-detail', kwargs={'pk': self.pk}, request=request)



class Pki(InfrastructureTemplate):
    """
    PKI
    """
    source = models.CharField(max_length=20, choices=PKI_CHOICES, default=PKI_DEFAULT, editable=True)

    class Meta:
        ordering = ['name',]
        verbose_name = 'PKI'
        verbose_name_plural = 'PKIs'

    def __str__(self):
        return str(self.name)

    def get_absolute_url(self, request=None):
        return reverse('api:ipam_pki-detail', kwargs={'pk': self.pk}, request=request)



class Security(InfrastructureTemplate):
    """
   Security
    """
    source = models.CharField(max_length=20, choices=SECURITY_CHOICES, default=SECURITY_DEFAULT, editable=True)


    class Meta:
        ordering = ['name',]
        verbose_name = 'Security'
        verbose_name_plural = 'Securities'

    def __str__(self):
        return str(self.name)


    def get_absolute_url(self, request=None):
        return reverse('api:ipam_security-detail', kwargs={'pk': self.pk}, request=request)


class Monitoring(InfrastructureTemplate):
    """
   Monitoring
    """
    source = models.CharField(max_length=20, choices=MONITORING_CHOICES, default=SECURITY_DEFAULT, editable=True)


    class Meta:
        ordering = ['name',]
        verbose_name = 'Monitoring'
        verbose_name_plural = 'Monitorings'

    def __str__(self):
        return str(self.name)


    def get_absolute_url(self, request=None):
        return reverse('api:ipam_monitoring-detail', kwargs={'pk': self.pk}, request=request)



class InfrastructureJob(InfrastructureTemplate):
    """
    Infrastructure Job
    """
    fk_model = models.CharField(max_length=50, editable=True, blank=True)
    fk_type = models.CharField(max_length=50, editable=True, blank=True)
    #fk_id = models.IntegerField(editable=True, blank=True)
    fk_id = models.CharField(max_length=20, editable=True, blank=True)

    class Meta:
        ordering = ['name',]

    def __str__(self):
        return str(self.name)


    def get_absolute_url(self, request=None):
        return reverse('api:ipam_infrastructure_job-detail', kwargs={'pk': self.pk}, request=request)




class DeviceTemplate(CreatedUpdatedModel):
    """
    Template for all devices (physical and virtual)
    """
    class Meta:
        abstract = True

    name = models.CharField(max_length=100, blank=True)
    description = models.CharField(max_length=100, blank=True)
    fqdn = models.CharField(max_length=200, blank=True)
    model = models.CharField(max_length=200, blank=True)
    sn = models.CharField(
        max_length=200, 
        blank=True,
        verbose_name=_('Serial Number'),
        help_text=_("Specifies the serial number of the device if exist"),
        )
    hosts = JSONField(
        blank=True,
        default={},
        editable=True,
        null=True,
    )
    artifacts = JSONField(
        blank=True,
        default={},
        editable=True,
        null=True,
    )
    credential = models.ForeignKey(
        'main.Credential',
        related_name='%(class)ss',
        blank=True,
        null=True,
        default=None,
        on_delete=models.SET_NULL,
    )
    datacenter = models.ForeignKey(
        'Datacenter', 
        related_name='%(class)ss',
        on_delete=models.PROTECT, 
        blank=True, 
        null=True
    )
    opts = JSONField(
        blank=True,
        default={},
        editable=True,
        null=True,
    )
    primary_ip = models.CharField(max_length=200, blank=True)
    primary_ip6 = models.CharField(max_length=200, blank=True)
    primary_mac = models.CharField(max_length=200, blank=True)
    primary_domain = models.CharField(max_length=200, blank=True)

    # opts

    opts_dict = VarsDictProperty('opts')


    def save(self, *args, **kwargs):
        if self.opts:
            # format to json before saving object
            self.opts = self.opts_dict
        super(DeviceTemplate, self).save(*args, **kwargs)



class BareMetal(DeviceTemplate):
    """
    BareMetal Hosts
    """

    class Meta:
        ordering = ['name',]

    def __str__(self):
        return str(self.name)

    def get_absolute_url(self, request=None):
        return reverse('api:ipam_bare_metal-detail', kwargs={'pk': self.pk}, request=request)



class VirtualHost(DeviceTemplate):
    """
    Virtual Hosts
    """

    provider = models.ForeignKey(
        'Provider', 
        related_name='%(class)ss',
        on_delete=models.PROTECT, 
        blank=True, 
        null=True
    )

    class Meta:
        ordering = ['name',]

    def __str__(self):
        return str(self.name)

    def get_absolute_url(self, request=None):
        return reverse('api:ipam_virtual_host-detail', kwargs={'pk': self.pk}, request=request)




class NetworkGear(DeviceTemplate):
    """
    Network Gears
    """


    class Meta:
        ordering = ['name',]

    def __str__(self):
        return str(self.name)


    def get_absolute_url(self, request=None):
        return reverse('api:ipam_network_gear-detail', kwargs={'pk': self.pk}, request=request)



class Registry(DeviceTemplate):
    """
    Registry
    """
    class Meta:
        ordering = ['name',]
        verbose_name = 'Registry'
        verbose_name_plural = 'Registries'

    def __str__(self):
        return str(self.name)


    def get_absolute_url(self, request=None):
        return reverse('api:ipam_registry-detail', kwargs={'pk': self.pk}, request=request)






class DeviceOptionsTemplate(CreatedUpdatedModel):
    """
    Template for all devices (physical and virtual)
    """
    class Meta:
        abstract = True

    hosts = JSONField(
        blank=True,
        default={},
        editable=True,
        null=True,
    )
    artifacts = JSONField(
        blank=True,
        default={},
        editable=True,
        null=True,
    )

    opts = JSONField(
        blank=True,
        default={},
        editable=True,
        null=True,
    )








    # job_template = models.ForeignKey(
    #     'JobTemplate',
    #     related_name='jobs',
    #     blank=True,
    #     null=True,
    #     default=None,
    #     on_delete=models.SET_NULL,
    # )
    # hosts = models.ManyToManyField(
    #     'Host',
    #     related_name='jobs',
    #     editable=False,
    #     through='JobHostSummary',
    # )
    # artifacts = JSONField(
    #     blank=True,
    #     default={},
    #     editable=False,
    # )
    # scm_revision = models.CharField(
    #     max_length=1024,
    #     blank=True,
    #     default='',
    #     editable=False,
    #     verbose_name=_('SCM Revision'),
    #     help_text=_('The SCM Revision from the Project used for this job, if available'),
    # )





    # scm_type = models.CharField(
    #     max_length=8,
    #     choices=SCM_TYPE_CHOICES,
    #     blank=True,
    #     default='',
    #     verbose_name=_('SCM Type'),
    #     help_text=_("Specifies the source control system used to store the project."),
    # )
    # scm_url = models.CharField(
    #     max_length=1024,
    #     blank=True,
    #     default='',
    #     verbose_name=_('SCM URL'),
    #     help_text=_("The location where the project is stored."),
    # )
    # scm_branch = models.CharField(
    #     max_length=256,
    #     blank=True,
    #     default='',
    #     verbose_name=_('SCM Branch'),
    #     help_text=_('Specific branch, tag or commit to checkout.'),
    # )
    # scm_clean = models.BooleanField(
    #     default=False,
    #     help_text=_('Discard any local changes before syncing the project.'),
    # )
    # scm_delete_on_update = models.BooleanField(
    #     default=False,
    #     help_text=_('Delete the project before syncing.'),
    # )
    # credential = models.ForeignKey(
    #     'Credential',
    #     related_name='%(class)ss',
    #     blank=True,
    #     null=True,
    #     default=None,
    #     on_delete=models.SET_NULL,
    # )



