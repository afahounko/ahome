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
                ngClick: 'showJobScript(provider.id)',
				awToolTip: 'Provider running status. Green:running, Blink:pending',
                dataPlacement: 'right',
                icon: "{{ 'icon-job-' + provider.job_status }}",
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
                ngBind: 'provider.opts.fk_type',
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
            columnClass: 'col-md-4 col-sm-4 col-xs-4',
            launch: {
                label: i18n._('Launch'),
                icon: 'icon-launch',
               	ngClick: "launchProvider(provider.id)",
                "class": 'btn-xs btn-default',
                awToolTip: i18n._('Launch Provider'),
                dataPlacement: 'top',
            },
		    poweroff: {
                label: i18n._('Stop Provider'),
                iconClass: 'fa fa-power-off',
               	ngClick: "poweroffProvider(provider.id, provider.name)",
                "class": 'btn-xs btn-default',
                awToolTip: i18n._('Stop Provider'),
                dataPlacement: 'top',
            },
			remove: {
                label: i18n._('Clean Provider'),
                iconClass: 'fa fa-remove',
               	ngClick: "removeProvider(provider.id, provider.name)",
                "class": 'btn-xs btn-default',
                awToolTip: i18n._('Remove Provider'),
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
