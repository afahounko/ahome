/*************************************************
 * Copyright (c) 2015 Ansible, Inc.
 *
 * All Rights Reserved
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
                ngClick: 'showSCMStatus(monitoring.id)',
//                awToolTip: '{{ project.statusTip }}',
				awToolTip: 'Update Succeed',
                dataTipWatch: 'project.statusTip',
                dataPlacement: 'right',
                icon: "icon-job-success",
                columnClass: "List-staticColumn--smallStatus",
                nosort: true,
                excludeModal: true
            },
            name: {
                key: true,
                label: i18n._('Name'),
                columnClass: 'col-md-3 col-sm-3 col-xs-9',
                awToolTip: "Redirect to Job Page",
                awTipPlacement: "top",
				ngClick: "infraJobs()",
            },
		    type: {
                label: i18n._('Type'),
                columnClass: 'col-md-3 col-sm-3 hidden-xs'
            },
			version: {
                label: i18n._('Version'),
                columnClass: 'col-md-3 col-sm-3 hidden-xs'
            },
			lastupdated: {
                label: i18n._('Last Updated'),
                columnClass: 'col-md-3 col-sm-3 hidden-xs'
            },
        },
/*
        actions: {
            add: {
                label: i18n._('Create New'),
                mode: 'all', // One of: edit, select, all
                ngClick: 'addApp()',
                awToolTip: i18n._('Create a new APP'),
                actionClass: 'at-Button--add',
                actionId: 'button-add',
                ngShow: 'canAdd'
            }
        },
*/
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
