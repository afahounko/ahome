/*************************************************
 * Copyright (c) 2015 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/

import {templateUrl} from '../../shared/template-url/template-url.factory';
import {N_} from "../../i18n";

export default {
    name: 'ipamSubnetsList',
    route: '/ipam_rirs',
    templateUrl: templateUrl('ipam-subnets/card/card'),
    controller: 'ipamSubnetsCardController',
    data: {
        activityStream: true,
        activityStreamTarget: 'job'
    },
    ncyBreadcrumb: {
        label: N_('IPAM SUBNETS')
    },
};
