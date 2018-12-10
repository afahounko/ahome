from django.shortcuts import render

# from rest_framework.decorators import action
from rest_framework.decorators import detail_route, list_route
from rest_framework.response import Response
from rest_framework import views

from rest_framework import  viewsets, mixins
from awx.ipam.models import * # noqa
from awx.ipam.serializers import * # noqa
from awx.main.utils import * # noqa
from awx.api.generics import get_view_name
from awx.api.generics import * # noqa

from awx.ipam.utils import sources # noqa
import os
import datetime
from collections import OrderedDict
from django.utils.translation import ugettext_lazy as _
# Create your views here.



## ViewSets define the view behavior.
class IpamRirViewSet(viewsets.ModelViewSet):
    queryset = Rir.objects.all()
    serializer_class = IpamRirSerializer



class IpamVrfViewSet(viewsets.ModelViewSet):
    queryset = Vrf.objects.all()
    serializer_class = IpamVrfSerializer


class IpamDatacenterViewSet(viewsets.ModelViewSet):
    queryset = Datacenter.objects.all()
    serializer_class = IpamDatacenterSerializer


class IpamAggregateViewSet(viewsets.ModelViewSet):
    queryset = Aggregate.objects.all()
    serializer_class = IpamAggregateSerializer



class IpamPrefixViewSet(viewsets.ModelViewSet):
    queryset = Prefix.objects.all()
    serializer_class = IpamPrefixSerializer


class IpamIPAddressViewSet(viewsets.ModelViewSet):
    queryset = IPAddress.objects.all()
    serializer_class = IpamIPAddressSerializer



class IpamVlanViewSet(viewsets.ModelViewSet):
    queryset = Vlan.objects.all()
    serializer_class = IpamVlanSerializer


class IpamProviderViewSet(viewsets.ModelViewSet):
    queryset = Provider.objects.all()
    serializer_class = IpamProviderSerializer

# Storage
class IpamStorageViewSet(viewsets.ModelViewSet):
    queryset = Storage.objects.all()
    serializer_class = IpamStorageSerializer

# Service
class IpamServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = IpamServiceSerializer

# Network
class IpamNetworkViewSet(viewsets.ModelViewSet):
    queryset = Network.objects.all()
    serializer_class = IpamNetworkSerializer


# App
class IpamAppViewSet(viewsets.ModelViewSet):
    queryset = App.objects.all()
    serializer_class = IpamAppSerializer

# Noc
class IpamNocViewSet(viewsets.ModelViewSet):
    queryset = Noc.objects.all()
    serializer_class = IpamNocSerializer


# Security
class IpamSecurityViewSet(viewsets.ModelViewSet):
    queryset = Security.objects.all()
    serializer_class = IpamSecuritySerializer


# Monitoring
class IpamMonitoringViewSet(viewsets.ModelViewSet):
    queryset = Monitoring.objects.all()
    serializer_class = IpamMonitoringSerializer


# PKI
class IpamPkiViewSet(viewsets.ModelViewSet):
    queryset = Pki.objects.all()
    serializer_class = IpamPkiSerializer



# Backup
class IpamBackupViewSet(viewsets.ModelViewSet):
    queryset = Backup.objects.all()
    serializer_class = IpamBackupSerializer


# Documentaton
class IpamDocumentationViewSet(viewsets.ModelViewSet):
    queryset = Documentation.objects.all()
    serializer_class = IpamDocumentationSerializer


# InfrastructureJob
class IpamInfrastructureJobViewSet(viewsets.ModelViewSet):
    queryset = InfrastructureJob.objects.all()
    serializer_class = IpamInfrastructureJobSerializer


# BareMetal
class IpamBareMetalViewSet(viewsets.ModelViewSet):
    queryset = BareMetal.objects.all()
    serializer_class = IpamBareMetalSerializer


# VirtualHost
class IpamVirtualHostViewSet(viewsets.ModelViewSet):
    queryset = VirtualHost.objects.all()
    serializer_class = IpamVirtualHostSerializer



# NetworkGear
class IpamNetworkGearViewSet(viewsets.ModelViewSet):
    queryset = NetworkGear.objects.all()
    serializer_class = IpamNetworkGearSerializer


# Registry
class IpamRegistryViewSet(viewsets.ModelViewSet):
    queryset = Registry.objects.all()
    serializer_class = IpamRegistrySerializer




# Infraastructure Source
class IpamInfrastructureUiViewSet(viewsets.ViewSet):
    # queryset = Registry.objects.all()
    # serializer_class = IpamRegistrySerializer

    def list(self, request, *args, **kwargs):
        # pass
        return Response( sources.infrastructure_api_source() )

    @list_route(methods=['get'])
    def group_names(self, request, pk=None, **kwargs):
        """
        Returns a list of all the group names that the given
        user belongs to.
        """
        return Response( {'demo': 'request'} )

    # def create(self, request):
    #     pass

    def retrieve(self, request, pk=None):
        pass

    # def update(self, request, pk=None):
    #     pass

    def partial_update(self, request, pk=None):
        pass

    def destroy(self, request, pk=None):
        pass




# Infraastructure Job Source
class IpamInfrastructureJobUiViewSet(viewsets.ViewSet):
    # queryset = Registry.objects.all()
    # serializer_class = IpamRegistrySerializer

    def list(self, request, *args, **kwargs):
        # pass
        return Response( sources.infrastructure_api_job_source() )


    def retrieve(self, request, pk=None):
        pass

    # def update(self, request, pk=None):
    #     pass

    def partial_update(self, request, pk=None):
        pass

    def destroy(self, request, pk=None):
        pass





class GenericSourceView(viewsets.ViewSet):


    def list(self, request, format=None, **kwargs):
        ''' Show Source Details '''
        DIRECTORY = "%s/ipam_sources/%s" % (sources.BASE_DIR, self.directory_name)
        data = {}
        directories = os.listdir( DIRECTORY )
        for directory in directories:
            data[directory] = reverse('api:ipam_%s_def-detail' % self.directory_name, kwargs={ 'pk': directory } )
        
            # data[_directory]['url'] = reverse('api:ipam_source-detail', kwargs={ 'pk': _directory } )

        return Response(data)


    def retrieve(self, request, pk=None, **kwargs):

        DIRECTORY = "%s/ipam_sources/%s" % (sources.BASE_DIR, self.directory_name)

        data = OrderedDict()

        files = os.listdir( "%s/%s"  % ( DIRECTORY, pk ) )
        data['count'] = len(files)
        data['results'] = []
        data['boxes'] = OrderedDict()
        data['related'] = OrderedDict()
        for file in files:
            voutput = sources.from_yml_get_related( "%s/%s/%s"  % ( DIRECTORY, pk, file ) )

#            data['results'].append(voutput['id'])
            if voutput['id'] != 'form' and voutput['id'] != None:
                data['results'].append(voutput['id'])
                data['boxes'][voutput['id']] = OrderedDict()
                data['boxes'][voutput['id']] = voutput

        data['count'] = len(data['results'])
        return Response( data )


class IpamInfrastructureSourceView(GenericSourceView):
    directory_name = 'infrastructures'
    view_name = _('Infrastructure Source')


class IpamResourceSourceView(GenericSourceView):
    directory_name = 'resources'
    view_name = _('Resource Source')



