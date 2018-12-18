/*************************************************
 * Copyright (c) 2018 Ansible, Inc.
 *
 * All Rights Reserved
 * Truegardener
 *************************************************/


export default ['i18n', function(i18n) {
    return {

        name: 'ipam_storages',
        iterator: 'storage',
        editTitle: i18n._('INFRA STORAGES'),
        listTitle: i18n._('INFRA STORAGES'),
        search: {
            order_by: 'name'
        },
        selectInstructions: '<p>Select existing users by clicking each user or checking the related checkbox. When finished, click the blue ' +
            '<em>Select</em> button, located bottom right.</p> <p>When available, a brand new user can be created by clicking the ' +
            '<i class=\"fa fa-plus\"></i> button.</p>',
        index: false,
        hover: true,
        fields: {
            status: {
                label: '',
                iconOnly: true,
                ngClick: 'showJobScript(storage.id)',
				awToolTip: 'Storage running status. Green:running, Blink:pending',
                dataPlacement: 'right',
                icon: "{{ 'icon-job-' + storage.job_status }}",
                columnClass: "List-staticColumn--smallStatus",
                nosort: true,
                excludeModal: true
            },
            name: {
                key: true,
                label: i18n._('Name'),
                columnClass: 'col-md-2 col-sm-2 col-xs-8',
                awToolTip: "Redirect to Job Page",
                awTipPlacement: "top",
				ngClick: "infraJobs()",
            },
			id: {
                label: i18n._('Type'),
                ngBind: 'storage.opts.fk_type',
                columnClass: 'col-md-2 col-sm-2 hidden-xs'
            },
            created: {
            	label: i18n._('Created'),
            	columnClass: 'col-md-2 col-sm-2 hidden-xs'
            },
            last_updated: {
                label: i18n._('Last Updated'),
                filter: "longDate",
                columnClass: "col-lg-3 hidden-md hidden-sm hidden-xs",
                excludeModal: true
            }
        },
        fieldActions: {
            columnClass: 'col-md-2 col-sm-3 col-xs-3',
            launch: {
                label: i18n._('Launch'),
                icon: 'icon-launch',
               	ngClick: "launchStorage(storage.id)",
                "class": 'btn-xs btn-default',
                awToolTip: i18n._('Launch Storage'),
                dataPlacement: 'top',
            },
		    poweroff: {
                label: i18n._('Stop Storage'),
                iconClass: 'fa fa-power-off',
               	ngClick: "poweroffStorage(storage.id, storage.name)",
                "class": 'btn-xs btn-default',
                awToolTip: i18n._('Stop Storage'),
                dataPlacement: 'top',
            },
			remove: {
                label: i18n._('Clean Storage'),
                iconClass: 'fa fa-remove',
               	ngClick: "removeStorage(storage.id, storage.name)",
                "class": 'btn-xs btn-default',
                awToolTip: i18n._('Remove Storage'),
                dataPlacement: 'top',
            },
            edit: {
                label: i18n._('Edit'),
                icon: 'icon-edit',
               	ngClick: "editStorage(storage.id)",
                "class": 'btn-xs btn-default',
                awToolTip: i18n._('Edit Storage'),
                dataPlacement: 'top',
            },
            view: {
                ngClick: "viewStorage(storage.id)",
                awToolTip: i18n._('View the Storage'),
                dataPlacement: 'top',
                icon: 'fa-eye',
            },
            schedule: {
                mode: 'all',
                ngClick: "editSchedules(storage.id)",
                awToolTip: i18n._('Schedule Storage'),
                dataPlacement: 'top',
            },
            copy: {
                label: i18n._('Copy'),
                ngClick: 'duplicateStorage(storage.id)',
                "class": 'btn-danger btn-xs',
                awToolTip: i18n._('Duplicate Storage'),
                dataPlacement: 'top',
            },
			"delete": {
                label: i18n._('Delete'),
                ngClick: "deleteStorage(storage.id, storage.name)",
                icon: 'icon-trash',
                "class": 'btn-xs btn-danger',
                awToolTip: i18n._('Delete Storage'),
                dataPlacement: 'top',
            }
        }
    };}];
