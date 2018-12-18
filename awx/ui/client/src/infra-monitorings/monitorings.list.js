/*************************************************
 * Copyright (c) 2018 Ansible, Inc.
 *
 * All Rights Reserved
 * Truegardener
 *************************************************/


export default ['i18n', function(i18n) {
    return {

        name: 'ipam_monitorings',
        iterator: 'monitoring',
        editTitle: i18n._('INFRA MONITORINGS'),
        listTitle: i18n._('INFRA MONITORINGS'),
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
                ngClick: 'showJobScript(monitoring.id)',
				awToolTip: 'Monitoring running status. Green:running, Blink:pending',
                dataPlacement: 'right',
                icon: "{{ 'icon-job-' + monitoring.job_status }}",
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
                ngBind: 'monitoring.opts.fk_type',
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
               	ngClick: "launchMonitoring(monitoring.id)",
                "class": 'btn-xs btn-default',
                awToolTip: i18n._('Launch Monitoring'),
                dataPlacement: 'top',
            },
		    poweroff: {
                label: i18n._('Stop Monitoring'),
                iconClass: 'fa fa-power-off',
               	ngClick: "poweroffMonitoring(monitoring.id, monitoring.name)",
                "class": 'btn-xs btn-default',
                awToolTip: i18n._('Stop Monitoring'),
                dataPlacement: 'top',
            },
			remove: {
                label: i18n._('Clean Monitoring'),
                iconClass: 'fa fa-remove',
               	ngClick: "removeMonitoring(monitoring.id, monitoring.name)",
                "class": 'btn-xs btn-default',
                awToolTip: i18n._('Remove Monitoring'),
                dataPlacement: 'top',
            },
            edit: {
                label: i18n._('Edit'),
                icon: 'icon-edit',
               	ngClick: "editMonitoring(monitoring.id)",
                "class": 'btn-xs btn-default',
                awToolTip: i18n._('Edit Monitoring'),
                dataPlacement: 'top',
            },
            view: {
                ngClick: "viewMonitoring(monitoring.id)",
                awToolTip: i18n._('View the Monitoring'),
                dataPlacement: 'top',
                icon: 'fa-eye',
            },
            schedule: {
                mode: 'all',
                ngClick: "editSchedules(monitoring.id)",
                awToolTip: i18n._('Schedule Monitoring'),
                dataPlacement: 'top',
            },
            copy: {
                label: i18n._('Copy'),
                ngClick: 'duplicateMonitoring(monitoring.id)',
                "class": 'btn-danger btn-xs',
                awToolTip: i18n._('Duplicate Monitoring'),
                dataPlacement: 'top',
            },
			"delete": {
                label: i18n._('Delete'),
                ngClick: "deleteMonitoring(monitoring.id, monitoring.name)",
                icon: 'icon-trash',
                "class": 'btn-xs btn-danger',
                awToolTip: i18n._('Delete Monitoring'),
                dataPlacement: 'top',
            }
        }
    };}];
