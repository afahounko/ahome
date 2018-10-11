/*************************************************
 * Copyright (c) 2015 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/


export default ['i18n', function(i18n) {
    return {

        name: 'ipam_prefixes',
        iterator: 'prefix',
        editTitle: i18n._('IPAM PREFIXES'),
        listTitle: i18n._('IPAM PREFIXES'),
        search: {
            order_by: 'prefix'
        },
        selectInstructions: '<p>Select existing users by clicking each user or checking the related checkbox. When finished, click the blue ' +
            '<em>Select</em> button, located bottom right.</p> <p>When available, a brand new user can be created by clicking the ' +
            '<i class=\"fa fa-plus\"></i> button.</p>',
        index: false,
        hover: true,

        fields: {
            prefix: {
                key: true,
                label: i18n._('Prefix'),
            },
		    datacenter: {
                label: i18n._('DATACENTER'),
               	ngBind: 'prefix.summary_fields.datacenter.name',
            },
			vrf: {
                label: i18n._('VRF'),
               	ngBind: 'prefix.summary_fields.vrf.name',
            },
			vlan: {
                label: i18n._('VLAN'),
               	ngBind: 'prefix.summary_fields.vlan.name',
            },
			is_pool: {
                label: i18n._('Is Pool'),
            },
	        status: {
                label: i18n._('Status'),
				ngBind: 'prefix.summary_fields.status.name',
            }
        },

        actions: {
            add: {
                label: i18n._('Create New'),
                mode: 'all', // One of: edit, select, all
                ngClick: 'addPrefix()',
                awToolTip: i18n._('Create a new Prefix'),
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
               	ngClick: "editPrefix(prefix.id)",
                "class": 'btn-xs btn-default',
                awToolTip: i18n._('Edit Prefix'),
                dataPlacement: 'top',
            },

            "delete": {
                label: i18n._('Delete'),
                ngClick: "deletePrefix(prefix.id, prefix.prefix)",
                icon: 'icon-trash',
                "class": 'btn-xs btn-danger',
                awToolTip: i18n._('Delete Prefix'),
                dataPlacement: 'top',
            }
        }
    };}];
