/*************************************************
 * Copyright (c) 2018 Ansible, Inc.
 *
 * All Rights Reserved
 * Truegardener
 *************************************************/


export default ['i18n', function(i18n) {
    return {

        name: 'ipam_services',
        iterator: 'service',
        editTitle: i18n._('INFRA BACKUPS'),
        listTitle: i18n._('INFRA BACKUPS'),
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
                ngClick: 'showJobScript(service.id)',
				awToolTip: 'Service running status. Green:running, Blink:pending',
                dataPlacement: 'right',
                icon: "{{ 'icon-job-' + service.job_status }}",
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
                ngBind: 'service.opts.fk_type',
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
               	ngClick: "launchService(service.id)",
                "class": 'btn-xs btn-default',
                awToolTip: i18n._('Launch Service'),
                dataPlacement: 'top',
            },
		    poweroff: {
                label: i18n._('Stop Service'),
                iconClass: 'fa fa-power-off',
               	ngClick: "poweroffService(service.id, service.name)",
                "class": 'btn-xs btn-default',
                awToolTip: i18n._('Stop Service'),
                dataPlacement: 'top',
            },
			remove: {
                label: i18n._('Clean Service'),
                iconClass: 'fa fa-remove',
               	ngClick: "removeService(service.id, service.name)",
                "class": 'btn-xs btn-default',
                awToolTip: i18n._('Remove Service'),
                dataPlacement: 'top',
            },
            edit: {
                label: i18n._('Edit'),
                icon: 'icon-edit',
               	ngClick: "editService(service.id)",
                "class": 'btn-xs btn-default',
                awToolTip: i18n._('Edit Service'),
                dataPlacement: 'top',
            },
            view: {
                ngClick: "viewService(service.id)",
                awToolTip: i18n._('View the Service'),
                dataPlacement: 'top',
                icon: 'fa-eye',
            },
            schedule: {
                mode: 'all',
                ngClick: "editSchedules(service.id)",
                awToolTip: i18n._('Schedule Service'),
                dataPlacement: 'top',
            },
            copy: {
                label: i18n._('Copy'),
                ngClick: 'duplicateService(service.id)',
                "class": 'btn-danger btn-xs',
                awToolTip: i18n._('Duplicate Service'),
                dataPlacement: 'top',
            },
			"delete": {
                label: i18n._('Delete'),
                ngClick: "deleteService(service.id, service.name)",
                icon: 'icon-trash',
                "class": 'btn-xs btn-danger',
                awToolTip: i18n._('Delete Service'),
                dataPlacement: 'top',
            }
        }
    };}];
