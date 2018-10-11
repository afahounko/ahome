/*************************************************
 * Copyright (c) 2015 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/


export default ['i18n', function(i18n) {
    return {

        name: 'ipam_providers',
        iterator: 'provider',
        editTitle: i18n._('INFRA PROVIDERS'),
        listTitle: i18n._('INFRA PROVIDERS'),
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
                ngClick: 'showSCMStatus(project.id)',
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
        fieldActions: {
            columnClass: 'col-md-2 col-sm-3 col-xs-3',

            launch: {
                label: i18n._('Launch'),
                icon: 'icon-launch',
               	ngClick: "launchProvider(provider.id)",
                "class": 'btn-xs btn-default',
                awToolTip: i18n._('Launch App'),
                dataPlacement: 'top',
            },
            edit: {
                label: i18n._('Edit'),
                icon: 'icon-edit',
               	ngClick: "editProvider(provider.id)",
                "class": 'btn-xs btn-default',
                awToolTip: i18n._('Edit Provider'),
                dataPlacement: 'top',
            },
			view: {
                ngClick: "viewProvider(provider.id)",
                awToolTip: i18n._('View the Provider'),
                dataPlacement: 'top',
                icon: 'fa-eye',
            },
            schedule: {
                mode: 'all',
                ngClick: "editSchedules(provider.id)",
                awToolTip: i18n._('Schedule Provider'),
                dataPlacement: 'top',
            },
            copy: {
                label: i18n._('Copy'),
                ngClick: 'duplicateProvider(provider.id)',
                "class": 'btn-danger btn-xs',
                awToolTip: i18n._('Duplicate Provider'),
                dataPlacement: 'top',
            },
			"delete": {
                label: i18n._('Delete'),
                ngClick: "deleteProvider(provider.id, provider.name)",
                icon: 'icon-trash',
                "class": 'btn-xs btn-danger',
                awToolTip: i18n._('Delete Provider'),
                dataPlacement: 'top',
            }
        }
    };}];
