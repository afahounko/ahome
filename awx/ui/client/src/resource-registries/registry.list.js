/*************************************************
 * Copyright (c) 2015 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/


export default ['i18n', function(i18n) {
    return {

        name: 'ipam_registries',
        iterator: 'registry',
        editTitle: i18n._('Registries'),
        listTitle: i18n._('Registries'),
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
		    fqdn: {
                label: i18n._('FQDN'),
                columnClass: 'col-md-3 col-sm-3 hidden-xs'
            },
			datacenter: {
                label: i18n._('Datacenter'),
                ngBind: 'registry.summary_fields.datacenter.name',
                sourceModel: 'datacenter',
                sourceField: 'name',
                excludeModal: true,
                columnClass: 'col-md-3 col-sm-3 hidden-xs'
            },
		    primary_ip: {
                label: i18n._('Primary IPv4'),
                columnClass: 'col-md-3 col-sm-3 hidden-xs'
            },
	        primary_mac: {
                label: i18n._('MAC'),
                columnClass: 'col-md-3 col-sm-3 hidden-xs'
            }
        },

        actions: {
            add: {
                label: i18n._('Create New'),
                mode: 'all', // One of: edit, select, all
                ngClick: 'addRegistry()',
                awToolTip: i18n._('Create a new registry'),
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
               	ngClick: "editRegistry(registry.id)",
                "class": 'btn-xs btn-default',
                awToolTip: i18n._('Edit registry'),
                dataPlacement: 'top',
            },

            "delete": {
                label: i18n._('Delete'),
                ngClick: "deleteRegistry(registry.id, registry.name)",
                icon: 'icon-trash',
                "class": 'btn-xs btn-danger',
                awToolTip: i18n._('Delete registry'),
                dataPlacement: 'top',
            }
        }
    };}];
