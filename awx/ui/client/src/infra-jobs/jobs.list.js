/*************************************************
 * Copyright (c) 2015 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/


export default ['i18n', function(i18n) {
    return {

        name: 'ipam_infrastructure_jobs',
        iterator: 'job',
        editTitle: i18n._('INFRA JOBS'),
        listTitle: i18n._('INFRA JOBS'),
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
                ngClick: 'showSCMStatus(job.id)',
//                awToolTip: '{{ project.statusTip }}',
				awToolTip: 'Job Template running status. Green:running, Blink:pending',
                dataPlacement: 'right',
                icon: "{{ 'icon-job-' + job.job_status }}",
                columnClass: "List-staticColumn--smallStatus",
                nosort: true,
                excludeModal: true
            },
            name: {
                label: i18n._('Name'),
                columnClass: 'col-md-3 col-sm-3 col-xs-9'
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
            ret: {
            	type: 'button',
				buttonContent: 'Return',
                label: i18n._('Back to Parent'),
                mode: 'all', // One of: edit, select, all
                ngClick: 'BackTo()',
                awToolTip: i18n._('Back to Parent'),
                actionId: 'button-return',
                ngShow: 'canAdd'
            }
        },*/
        fieldActions: {

            columnClass: 'col-md-2 col-sm-3 col-xs-3',
            
            launch: {
                label: i18n._('Launch'),
                icon: 'icon-launch',
               	ngClick: "launchJob(job.id)",
                "class": 'btn-xs btn-default',
                awToolTip: i18n._('Launch Job'),
                dataPlacement: 'top',
            },
            edit: {
                label: i18n._('Edit'),
                icon: 'icon-edit',
               	ngClick: "editJob(job.id)",
                "class": 'btn-xs btn-default',
                awToolTip: i18n._('Edit Job'),
                dataPlacement: 'top',
            },
			view: {
                ngClick: "viewJob(job.id)",
                awToolTip: i18n._('View the Job'),
                dataPlacement: 'top',
                icon: 'fa-eye',
            },
            schedule: {
                mode: 'all',
                ngClick: "editSchedules(job.id)",
                awToolTip: i18n._('Schedule Job'),
                dataPlacement: 'top',
            },
            copy: {
                label: i18n._('Copy'),
                ngClick: 'duplicateJob(job.id)',
                "class": 'btn-danger btn-xs',
                awToolTip: i18n._('Duplicate Job'),
                dataPlacement: 'top',
            },
			"delete": {
                label: i18n._('Delete'),
                ngClick: "deleteJob(job.id, job.name)",
                icon: 'icon-trash',
                "class": 'btn-xs btn-danger',
                awToolTip: i18n._('Delete Job'),
                dataPlacement: 'top',
            }
        }
    };}];
