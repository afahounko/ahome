/*************************************************
 * Copyright (c) 2015 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/


export default ['i18n', function(i18n) {
    return {

        name: 'ipam_vrfs',
        iterator: 'vrf',
        editTitle: i18n._('IPAM VRFS'),
        listTitle: i18n._('IPAM VRFS'),
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
                columnClass: 'col-md-3 col-sm-3'
            },
		    rd: {
                label: i18n._('RD'),
                columnClass: 'col-md-3 col-sm-3 hidden-xs'
            },
		    datacenter: {
                label: i18n._('DATACENTER'),
               	ngBind: 'vrf.summary_fields.datacenter.name',
                columnClass: 'col-md-3 col-sm-3 hidden-xs'
            },
		    enforce_unique: {
                label: i18n._('ENFORCE'),
                columnClass: 'col-md-3 col-sm-3 hidden-xs'
            }
        },

        actions: {
            add: {
                label: i18n._('Create New'),
                mode: 'all', // One of: edit, select, all
                ngClick: 'addVrf()',
                awToolTip: i18n._('Create a new Vrf'),
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
               	ngClick: "editVrf(vrf.id)",
                "class": 'btn-xs btn-default',
                awToolTip: i18n._('Edit Vrf'),
                dataPlacement: 'top',
            },

            "delete": {
                label: i18n._('Delete'),
                ngClick: "deleteVrf(vrf.id, vrf.name)",
                icon: 'icon-trash',
                "class": 'btn-xs btn-danger',
                awToolTip: i18n._('Delete Vrf'),
                dataPlacement: 'top',
            }
        }
    };}];
