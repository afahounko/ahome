/*************************************************
 * Copyright (c) 2018 Ansible, Inc.
 *
 * All Rights Reserved
 * Truegardener
 *************************************************/


export default ['i18n', function(i18n) {
    return {

        name: 'ipam_networks',
        iterator: 'network',
        editTitle: i18n._('INFRA NETWORKS'),
        listTitle: i18n._('INFRA NETWORKS'),
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
                ngClick: 'showJobScript(network.id)',
				awToolTip: 'Network running status. Green:running, Blink:pending',
                dataPlacement: 'right',
                icon: "{{ 'icon-job-' + network.job_status }}",
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
                ngBind: 'network.opts.fk_type',
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
               	ngClick: "launchNetwork(network.id)",
                "class": 'btn-xs btn-default',
                awToolTip: i18n._('Launch Network'),
                dataPlacement: 'top',
            },
		    poweroff: {
                label: i18n._('Stop Network'),
                iconClass: 'fa fa-power-off',
               	ngClick: "poweroffNetwork(network.id, network.name)",
                "class": 'btn-xs btn-default',
                awToolTip: i18n._('Stop Network'),
                dataPlacement: 'top',
            },
			remove: {
                label: i18n._('Clean Network'),
                iconClass: 'fa fa-remove',
               	ngClick: "removeNetwork(network.id, network.name)",
                "class": 'btn-xs btn-default',
                awToolTip: i18n._('Remove Network'),
                dataPlacement: 'top',
            },
            edit: {
                label: i18n._('Edit'),
                icon: 'icon-edit',
               	ngClick: "editNetwork(network.id)",
                "class": 'btn-xs btn-default',
                awToolTip: i18n._('Edit Network'),
                dataPlacement: 'top',
            },
            view: {
                ngClick: "viewNetwork(network.id)",
                awToolTip: i18n._('View the Network'),
                dataPlacement: 'top',
                icon: 'fa-eye',
            },
            schedule: {
                mode: 'all',
                ngClick: "editSchedules(network.id)",
                awToolTip: i18n._('Schedule Network'),
                dataPlacement: 'top',
            },
            copy: {
                label: i18n._('Copy'),
                ngClick: 'duplicateNetwork(network.id)',
                "class": 'btn-danger btn-xs',
                awToolTip: i18n._('Duplicate Network'),
                dataPlacement: 'top',
            },
			"delete": {
                label: i18n._('Delete'),
                ngClick: "deleteNetwork(network.id, network.name)",
                icon: 'icon-trash',
                "class": 'btn-xs btn-danger',
                awToolTip: i18n._('Delete Network'),
                dataPlacement: 'top',
            }
        }
    };}];
