/*************************************************
 * Copyright (c) 2015 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/

  /**
 * @ngdoc function
 * @name forms.function:Datacenters
 * @description This form is for adding/editing ipam_prefixes
*/

export default ['i18n', function(i18n) {
        return {

            addTitle: i18n._('NEW AGGREGATE'),
            editTitle: '{{ prefix }}',
            name: 'aggregate',
            basePath: 'ipam_aggregates',
            // the top-most node of generated state tree
            stateTree: 'ipamAggregatesList',
            breadcrumbName: i18n._('IPAM AGGREGATE'),
        	showActions: true,
            fields: {
                prefix: {
                    label: i18n._('Prefix'),
                    type: 'text',
                    ngDisabled: '!(user_obj.summary_fields.user_capabilities.edit || canAdd)',
                    required: true,
                },
			    description: {
                    label: i18n._('Description'),
                    type: 'text',
                    ngDisabled: '!(user_obj.summary_fields.user_capabilities.edit || canAdd)',
                },
				datacenter: {
                    label: i18n._('Datacenter'),
                    type: 'select',
                    defaultText: 'Choose a Datacenter',
                    ngModel: 'datacenter',
                    ngOptions: 'item as item.label for item in datacenter_type_options',
                    ngDisabled: '!(user_obj.summary_fields.user_capabilities.edit || canAdd)',
                    required: true,
                },
				rir: {
                    label: i18n._('Rir'),
                    type: 'select',
                    defaultText: 'Choose a RIR',
                    ngModel: 'rir',
                    ngOptions: 'item as item.label for item in rir_type_options',
                    ngDisabled: '!(user_obj.summary_fields.user_capabilities.edit || canAdd)',
					required: true,
                }
            },

            buttons: {
                cancel: {
                    ngClick: 'formCancel()',
                    ngShow: '(user_obj.summary_fields.user_capabilities.edit || canAdd)'
                },
                close: {
                    ngClick: 'formCancel()',
                    ngShow: '!(user_obj.summary_fields.user_capabilities.edit || canAdd)'
                },
                save: {
                    ngClick: 'formSave()',
                    ngDisabled: true,
                    ngShow: '(user_obj.summary_fields.user_capabilities.edit || canAdd)'
                }
            },
        };}];
