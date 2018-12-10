/*************************************************
 * Copyright (c) 2015 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/


export default ['i18n', function(i18n) {
    return {

        name: 'ipam_ip_addresses',
        iterator: 'ipaddr',
        editTitle: i18n._('IPAM IP ADDRESS'),
        listTitle: i18n._('IPAM IP ADDRESS'),
        search: {
            order_by: 'address'
        },
        selectInstructions: '<p>Select existing users by clicking each user or checking the related checkbox. When finished, click the blue ' +
            '<em>Select</em> button, located bottom right.</p> <p>When available, a brand new user can be created by clicking the ' +
            '<i class=\"fa fa-plus\"></i> button.</p>',
        index: false,
        hover: true,

        fields: {
            address: {
                key: true,
                label: i18n._('Address'),
                columnClass: 'col-md-3 col-sm-3 col-xs-9'
            },
			datacenter: {
                label: i18n._('Datacenter'),
                ngBind: 'ipaddr.summary_fields.datacenter.name',
                sourceModel: 'datacenter',
                sourceField: 'name',
                excludeModal: true,
                columnClass: 'col-md-3 col-sm-3 hidden-xs'
            },
			vrf: {
                label: i18n._('Vrf'),
                ngBind: 'ipaddr.summary_fields.vrf.name',
                sourceModel: 'vrf',
                sourceField: 'name',
                excludeModal: true,
                columnClass: 'col-md-3 col-sm-3 hidden-xs'
            },
			status: {
                label: i18n._('Status'),
                ngBind: 'ipaddr.summary_fields.status.name',
                sourceModel: 'status',
                sourceField: 'name',
                excludeModal: true,
                columnClass: 'col-md-3 col-sm-3 hidden-xs'
            },
        },

        actions: {
            add: {
                label: i18n._('Create New'),
                mode: 'all', // One of: edit, select, all
                ngClick: 'addIPAddr()',
                awToolTip: i18n._('Create a new IP address'),
                actionClass: 'at-Button--add',
                actionId: 'button-add',
                ngShow: 'canAdd'
            }
        },

        fieldActions: {

            columnClass: 'col-md-2 col-sm-3 col-xs-3',

            edit: {
                label: i18n._('Edit'),
                icon: 'icon-edit',
               	ngClick: "editIPAddr(ipaddr.id)",
                "class": 'btn-xs btn-default',
                awToolTip: i18n._('Edit IP Address'),
                dataPlacement: 'top',
            },

            "delete": {
                label: i18n._('Delete'),
                ngClick: "deleteIPAddr(ipaddr.id, ipaddr.address)",
                icon: 'icon-trash',
                "class": 'btn-xs btn-danger',
                awToolTip: i18n._('Delete IP Address'),
                dataPlacement: 'top',
            }
        }
    };}];
