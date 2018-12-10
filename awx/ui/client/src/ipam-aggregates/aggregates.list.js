/*************************************************
 * Copyright (c) 2015 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/


export default ['i18n', function(i18n) {
    return {

        name: 'ipam_aggregates',
        iterator: 'aggregate',
        editTitle: i18n._('IPAM AGGREGATES'),
        listTitle: i18n._('IPAM AGGREGATES'),
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
                columnClass: 'col-md-3 col-sm-3 col-xs-9'
            },
		    datacenter: {
                label: i18n._('DATACENTER'),
               	ngBind: 'aggregate.summary_fields.datacenter.name',
               	sourceModel: 'datacenter',
                sourceField: 'name',
               	columnClass: 'col-md-3 col-sm-3 hidden-xs'
            },
			rir: {
                label: i18n._('RIR'),
               	ngBind: 'aggregate.summary_fields.rir.name',
               	sourceModel: 'rir',
                sourceField: 'name',
               	columnClass: 'col-md-3 col-sm-3 hidden-xs'
            },
        },

        actions: {
            add: {
                label: i18n._('Create New'),
                mode: 'all', // One of: edit, select, all
                ngClick: 'addAggregate()',
                awToolTip: i18n._('Create a new Aggregate'),
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
               	ngClick: "editAggregate(aggregate.id)",
                "class": 'btn-xs btn-default',
                awToolTip: i18n._('Edit Aggregate'),
                dataPlacement: 'top',
            },

            "delete": {
                label: i18n._('Delete'),
                ngClick: "deleteAggregate(aggregate.id, aggregate.prefix)",
                icon: 'icon-trash',
                "class": 'btn-xs btn-danger',
                awToolTip: i18n._('Delete Aggregate'),
                dataPlacement: 'top',
            }
        }
    };}];
