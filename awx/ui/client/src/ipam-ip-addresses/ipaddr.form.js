/*************************************************
 * Copyright (c) 2015 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/

  /**
 * @ngdoc function
 * @name forms.function:Datacenters
 * @description This form is for adding/editing ipam_datacenters
*/

export default ['i18n', function(i18n) {
        return {

            addTitle: i18n._('NEW IP ADDRESS'),
            editTitle: '{{ address }}',
            name: 'ipaddr',
            basePath: 'ipam_ip_addresses',
            // the top-most node of generated state tree
            stateTree: 'ipamIpAddressesList',
            breadcrumbName: i18n._('IPAM IP ADDRESS'),
        	showActions: true,
            fields: {
                address: {
                    label: i18n._('Address'),
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
				vrf: {
                    label: i18n._('Vrf'),
                    type: 'select',
					defaultText: 'Choose a VRF',
                    ngModel: 'vrf',
                    ngOptions: 'item as item.label for item in vrf_type_options',
                    ngDisabled: '!(user_obj.summary_fields.user_capabilities.edit || canAdd)',
                },
				status: {
                    label: i18n._('Status'),
                    type: 'select',
                    ngModel: 'status',
                    ngOptions: 'item as item.label for item in status_type_options',
                    disableChooseOption: true,
                    ngDisabled: '!(user_obj.summary_fields.user_capabilities.edit || canAdd)',
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
