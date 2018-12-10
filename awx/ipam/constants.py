from __future__ import unicode_literals

from django.utils.translation import ugettext_lazy as _


# IP address families
AF_CHOICES = (
    (4, 'IPv4'),
    (6, 'IPv6'),
)

# Prefix statuses
PREFIX_STATUS_CONTAINER = 0
PREFIX_STATUS_ACTIVE = 1
PREFIX_STATUS_RESERVED = 2
PREFIX_STATUS_DEPRECATED = 3
PREFIX_STATUS_CHOICES = (
    (PREFIX_STATUS_CONTAINER, 'Container'),
    (PREFIX_STATUS_ACTIVE, 'Active'),
    (PREFIX_STATUS_RESERVED, 'Reserved'),
    (PREFIX_STATUS_DEPRECATED, 'Deprecated')
)


# STATUS FOR SUMMARY FIELDS

STATUS_PREFIX_SUMMARY = {
    PREFIX_STATUS_CONTAINER:'Container',
    PREFIX_STATUS_ACTIVE: 'Active',
    PREFIX_STATUS_RESERVED: 'Reserved',
    PREFIX_STATUS_DEPRECATED: 'Deprecated'
}




# IP address statuses
IPADDRESS_STATUS_ACTIVE = 1
IPADDRESS_STATUS_RESERVED = 2
IPADDRESS_STATUS_DEPRECATED = 3
IPADDRESS_STATUS_DHCP = 5
IPADDRESS_STATUS_CHOICES = (
    (IPADDRESS_STATUS_ACTIVE, 'Active'),
    (IPADDRESS_STATUS_RESERVED, 'Reserved'),
    (IPADDRESS_STATUS_DEPRECATED, 'Deprecated'),
    (IPADDRESS_STATUS_DHCP, 'DHCP')
)


# STATUS FOR SUMMARY FIELDS
STATUS_IPADDRESS_SUMMARY = {
    IPADDRESS_STATUS_ACTIVE: 'Active',
    IPADDRESS_STATUS_RESERVED: 'Reserved',
    IPADDRESS_STATUS_DEPRECATED: 'Deprecated',
    IPADDRESS_STATUS_DHCP: 'DHCP'
}





# IP address roles
IPADDRESS_ROLE_LOOPBACK = 10
IPADDRESS_ROLE_SECONDARY = 20
IPADDRESS_ROLE_ANYCAST = 30
IPADDRESS_ROLE_VIP = 40
IPADDRESS_ROLE_VRRP = 41
IPADDRESS_ROLE_HSRP = 42
IPADDRESS_ROLE_GLBP = 43
IPADDRESS_ROLE_CARP = 44
IPADDRESS_ROLE_CHOICES = (
    (IPADDRESS_ROLE_LOOPBACK, 'Loopback'),
    (IPADDRESS_ROLE_SECONDARY, 'Secondary'),
    (IPADDRESS_ROLE_ANYCAST, 'Anycast'),
    (IPADDRESS_ROLE_VIP, 'VIP'),
    (IPADDRESS_ROLE_VRRP, 'VRRP'),
    (IPADDRESS_ROLE_HSRP, 'HSRP'),
    (IPADDRESS_ROLE_GLBP, 'GLBP'),
    (IPADDRESS_ROLE_CARP, 'CARP'),
)

# VLAN statuses
VLAN_STATUS_ACTIVE = 1
VLAN_STATUS_RESERVED = 2
VLAN_STATUS_DEPRECATED = 3
VLAN_STATUS_CHOICES = (
    (VLAN_STATUS_ACTIVE, 'Active'),
    (VLAN_STATUS_RESERVED, 'Reserved'),
    (VLAN_STATUS_DEPRECATED, 'Deprecated')
)

# Bootstrap CSS classes
STATUS_CHOICE_CLASSES = {
    0: 'default',
    1: 'primary',
    2: 'info',
    3: 'danger',
    4: 'warning',
    5: 'success',
}

ROLE_CHOICE_CLASSES = {
    10: 'default',
    20: 'primary',
    30: 'warning',
    40: 'success',
    41: 'success',
    42: 'success',
    43: 'success',
    44: 'success',
}

# IP protocols (for services)
IP_PROTOCOL_TCP = 6
IP_PROTOCOL_UDP = 17
IP_PROTOCOL_CHOICES = (
    (IP_PROTOCOL_TCP, 'TCP'),
    (IP_PROTOCOL_UDP, 'UDP'),
)



SCM_TYPE_CHOICES = [
        ('', _('Manual')),
        ('git', _('Git')),
        ('hg', _('Mercurial')),
        ('svn', _('Subversion')),
        ('insights', _('Red Hat Insights')),
    ]



# PROVIDERS TYPE
PROVIDER_DEFAULT = ''
PROVIDER_CHOICES = (
    ('kvm', 'KVM'),
    ('rhev', 'RHEV'),
    ('', 'Cloud Providers'),
    ('dockerce', 'Docker Engine Community Edition'),
    ('vmware', 'VmWare/vCenter'),
    ('ocp', 'Origin/OpenShift Container Platform'),
    ('rh_ocp', _('Red Hat OpenShift Container Platform')),
    ('rh_osp', 'Red Hat OpenStack Platform'),
    ('kubernetes', 'kubernetes'),
    ('gce', 'Google Compute Engine'),
    ('azure', 'Microsoft Azure'),
    ('aws', 'Amazon EC2'),
)



# STORAGE TYPE
STORAGE_DEFAULT = ''
STORAGE_CHOICES = (
    ('', _('Local')),
    ('nfs', 'NFS'),
    ('cifs', 'CIFS'),
    ('glusterfs', 'Gluster FS'),
    ('rh_glusterfs', _('Red Hat Gluster FS')),
    ('ceph', 'CEPH'),
    ('rh_ceph', _('Red Hat CEPH')),
)



# NETWORK TYPE
NETWORK_DEFAULT = ''
NETWORK_CHOICES = (
    ('', _('None')),
    ('phyical', 'PHYSICAL'),
    ('bridge', 'VIRTUAL BRIDGE'),
    ('ovs', 'OpenvSwitch'),
)



# SERVCIES TYPE
SERVICE_DEFAULT = ''
SERVICE_CHOICES = (
    ('', _('None')),
    ('rh_satellite6', _('Red Hat Satellite 6')),
    ('rh_ansible_tower', _('Red Hat Ansible Tower')),
    ('isc_dhcp', _('isc DHCP')),
    ('isc_dns', _('isc DNS')),
    ('rh_idm', _('Red Hat Identity Manager')),
    ('freeipa', _('FreeIPA')),
    ('gitlab', _('GitLab')),
)



# APP TYPE
APP_DEFAULT = ''
APP_CHOICES = (
    ('', _('None')),
    ('pod', _('Kubernetes/OpenShift POD')),
    ('container', _('Container Apps')),
)


# NOC TYPE
NOC_DEFAULT = ''
NOC_CHOICES = (
    ('', _('None')),
    ('nagios', _('Nagions POD')),
    ('centreon', _('Centreon')),
    ('librenms', _('LibreNMS')),
    ('elk', _('Elasticsearch Logstash Kibana')),
)


# BACKUP TYPE
BACKUP_DEFAULT = ''
BACKUP_CHOICES = (
    ('', _('None')),
    ('bacula', _('Bacula')),
    ('spiderOaK', _('spiderOaK')),
)



# DOCUMENTATION TYPE
DOCUMENTATION_DEFAULT = ''
DOCUMENTATION_CHOICES = (
    ('', _('None')),
    ('wiki', _('WIKI DOC')),
    ('readme', _('Markdown Doc')),
)


# PKI TYPE
PKI_DEFAULT = ''
PKI_CHOICES = (
    ('', _('None')),
    ('idm', _('Red Hat IDM')),
    ('freeipa', _('FreeIPA')),
)


# SECURITY TYPE
SECURITY_DEFAULT = ''
SECURITY_CHOICES = (
    ('', _('None')),
)


# MONITORING TYPE
MONITORING_DEFAULT = ''
MONITORING_CHOICES = (
    ('', _('None')),
)




# # PROVIDERS TYPE
# PROVIDER_DEFAULT = 'kvm'
# PROVIDER_CHOICES = (
#     ('kvm', 'KVM'),
#     ('rhev', 'RHEV'),
#     ('internet', 'cloud Providers'),
#     ('docker', 'Docker Engine'),
#     ('vmware', 'VmWare/vCenter'),
#     ('ocp', 'OpenShift Container Platform'),
#     ('osp', 'OpenStack Platform'),
#     ('kubernetes', 'kubernetes'),
#     ('gce', 'Google Compute Engine'),
#     ('azure', 'Microsoft Azure'),
#     ('aws', 'Amazon EC2'),
# )




