/*************************************************
 * Copyright (c) 2015 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/


export default ['i18n', function(i18n) {
    return {

        name: 'ipam_documentations',
        iterator: 'documentation',
        editTitle: i18n._('INFRA DOCUMENTATION'),
        listTitle: i18n._('INFRA DOCUMENTATION'),
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
                ngClick: 'showSCMStatus(documentation.id)',
//                awToolTip: '{{ documentation.statusTip }}',
				awToolTip: 'Update Succeed',
                dataTipWatch: 'documentation.statusTip',
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
               	ngClick: "launchDocumentation(documentation.id)",
                "class": 'btn-xs btn-default',
                awToolTip: i18n._('Launch App'),
                dataPlacement: 'top',
            },
            edit: {
                label: i18n._('Edit'),
                icon: 'icon-edit',
               	ngClick: "editDocumentation(documentation.id)",
                "class": 'btn-xs btn-default',
                awToolTip: i18n._('Edit Documentation'),
                dataPlacement: 'top',
            },
			view: {
                ngClick: "viewDocumentation(documentation.id)",
                awToolTip: i18n._('View the Documentation'),
                dataPlacement: 'top',
                icon: 'fa-eye',
            },
            schedule: {
                mode: 'all',
                ngClick: "editSchedules(documentation.id)",
                awToolTip: i18n._('Schedule Documentation'),
                dataPlacement: 'top',
            },
            copy: {
                label: i18n._('Copy'),
                ngClick: 'duplicateDocumentation(documentation.id)',
                "class": 'btn-danger btn-xs',
                awToolTip: i18n._('Duplicate Documentation'),
                dataPlacement: 'top',
            },
			"delete": {
                label: i18n._('Delete'),
                ngClick: "deleteDocumentation(documentation.id, documentation.name)",
                icon: 'icon-trash',
                "class": 'btn-xs btn-danger',
                awToolTip: i18n._('Delete Documentation'),
                dataPlacement: 'top',
            }
        }
    };}];
