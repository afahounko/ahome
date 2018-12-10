/*************************************************
 * Copyright (c) 2015 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/

  /**
 * @ngdoc function
 * @name forms.function:Datacenters
 * @description This form is for adding/editing VLAN
*/

export default ['i18n', function(i18n) {
        return {

            addTitle: i18n._('NEW VLAN'),
            editTitle: '{{ name }}',
            name: 'vlan',
            basePath: 'ipam_vlans',
            // the top-most node of generated state tree
            stateTree: 'ipamVlansList',
            breadcrumbName: i18n._('IPAM VLAN'),
        	showActions: true,
            fields: {
                name: {
                    label: i18n._('Name'),
                    type: 'text',
                    ngDisabled: '!(user_obj.summary_fields.user_capabilities.edit || canAdd)',
                    required: true,
                },
			    description: {
                    label: i18n._('Description'),
                    type: 'text',
                    ngDisabled: '!(user_obj.summary_fields.user_capabilities.edit || canAdd)',
                    required: true,
                },
				vid: {
                    label: i18n._('Vid'),
                    type: 'number',
                    integer: true,
                    min: 1,
                    spinner: true,
                    'class': "input-small",
                    column: 1,
                    dataTitle: i18n._('Forks'),
                    ngDisabled: '!(user_obj.summary_fields.user_capabilities.edit || canAdd)',
                    required: true,
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
				status: {
                    label: i18n._('Status'),
                    type: 'select',
                    ngModel: 'status',
                    ngOptions: 'item as item.label for item in status_type_options',
                    disableChooseOption: true,
                    ngDisabled: '!(user_obj.summary_fields.user_capabilities.edit || canAdd)',
                    required: true,
                },
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
            }
        };}];
