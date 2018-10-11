/*************************************************
 * Copyright (c) 2015 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/


export default ['i18n', function(i18n) {
    return {

        name: 'ipam_vlans',
        iterator: 'vlan',
        editTitle: i18n._('IPAM VLANS'),
        listTitle: i18n._('IPAM VLANS'),
        search: {
            order_by: 'name'
        },
        selectInstructions: '<p>Select existing users by clicking each user or checking the related checkbox. When finished, click the blue ' +
            '<em>Select</em> button, located bottom right.</p> <p>When available, a brand new user can be created by clicking the ' +
            '<i class=\"fa fa-plus\"></i> button.</p>',
        index: false,
        hover: true,

        fields: {
            name: {
                key: true,
                label: i18n._('Name'),
                columnClass: 'col-md-3 col-sm-3 col-xs-9'
            },
	        vid: {
                key: true,
                label: i18n._('VID'),
                columnClass: 'col-md-3 col-sm-3 col-xs-9'
            },
			datacenter: {
                label: i18n._('Datacenter'),
                ngBind: 'vlan.summary_fields.datacenter.name',
                sourceModel: 'datacenter',
                sourceField: 'name',
                excludeModal: true,
                columnClass: 'col-md-3 col-sm-3 hidden-xs'
            },
			status: {
                label: i18n._('Status'),
                ngBind: 'vlan.summary_fields.status.name',
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
                ngClick: 'addVLan()',
                awToolTip: i18n._('Create a new VLan'),
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
               	ngClick: "editVLan(vlan.id)",
                "class": 'btn-xs btn-default',
                awToolTip: i18n._('Edit VLan'),
                dataPlacement: 'top',
            },

            "delete": {
                label: i18n._('Delete'),
                ngClick: "deleteVLan(vlan.id, vlan.name)",
                icon: 'icon-trash',
                "class": 'btn-xs btn-danger',
                awToolTip: i18n._('Delete VLan'),
                dataPlacement: 'top',
            }
        }
    };}];
