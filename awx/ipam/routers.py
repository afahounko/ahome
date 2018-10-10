from rest_framework import routers


from rest_framework import routers
from awx.ipam.views import *  # noqa

# Routers provide a way of automatically determining the URL conf.
ipam_router = routers.DefaultRouter()
ipam_router.register(r'ipam_rirs', IpamRirViewSet, base_name="ipam_rir")
ipam_router.register(r'ipam_vrfs', IpamVrfViewSet, base_name="ipam_vrf")
ipam_router.register(r'ipam_datacenters', IpamDatacenterViewSet, base_name="ipam_datacenter")
ipam_router.register(r'ipam_aggregates', IpamAggregateViewSet, base_name="ipam_aggregate")
ipam_router.register(r'ipam_prefixes', IpamPrefixViewSet, base_name="ipam_prefix")
ipam_router.register(r'ipam_ip_addresses', IpamIPAddressViewSet, base_name="ipam_ip_address")
ipam_router.register(r'ipam_vlans', IpamVlanViewSet, base_name="ipam_vlan")
ipam_router.register(r'ipam_providers', IpamProviderViewSet, base_name="ipam_provider")

ipam_router.register(r'ipam_storages', IpamStorageViewSet, base_name="ipam_storage")
ipam_router.register(r'ipam_services', IpamServiceViewSet, base_name="ipam_service")
ipam_router.register(r'ipam_networks', IpamNetworkViewSet, base_name="ipam_network")
ipam_router.register(r'ipam_apps', IpamAppViewSet, base_name="ipam_app")
ipam_router.register(r'ipam_nocs', IpamNocViewSet, base_name="ipam_noc")
ipam_router.register(r'ipam_backups', IpamBackupViewSet, base_name="ipam_backup")
ipam_router.register(r'ipam_documentations', IpamDocumentationViewSet, base_name="ipam_documentation")
ipam_router.register(r'ipam_pkis', IpamPkiViewSet, base_name="ipam_pki")
ipam_router.register(r'ipam_securities', IpamSecurityViewSet, base_name="ipam_security")
ipam_router.register(r'ipam_monitorings', IpamMonitoringViewSet, base_name="ipam_monitoring")
ipam_router.register(r'ipam_bare_metals', IpamBareMetalViewSet, base_name="ipam_bare_metal")
ipam_router.register(r'ipam_virtual_hosts', IpamVirtualHostViewSet, base_name="ipam_virtual_host")
ipam_router.register(r'ipam_network_gears', IpamNetworkGearViewSet, base_name="ipam_network_gear")
ipam_router.register(r'ipam_registries', IpamRegistryViewSet, base_name="ipam_registry")
ipam_router.register(r'ipam_infrastructure_jobs', IpamInfrastructureJobViewSet, base_name="ipam_infrastructure_job")



# IpamInfrastructureSourceViewSet
ipam_router.register(r'ipam_infrastructure_uis', IpamInfrastructureUiViewSet, base_name="ipam_infrastructure_ui")
ipam_router.register(r'ipam_infrastructure_jobs_uis', IpamInfrastructureJobUiViewSet, base_name="ipam_infrastructure_jobs_ui")


ipam_router.register(r'ipam_infrastructures_defs', IpamInfrastructureSourceView, base_name="ipam_infrastructures_def")
ipam_router.register(r'ipam_resources_defs', IpamResourceSourceView, base_name="ipam_resources_def")




