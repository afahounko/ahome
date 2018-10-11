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

            addTitle: i18n._('NEW PREFIX'),
            editTitle: '{{ prefix }}',
            name: 'prefix',
            basePath: 'ipam_prefixes',
            // the top-most node of generated state tree
            stateTree: 'ipamPrefixesList',
            breadcrumbName: i18n._('IPAM PREFIX'),
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
				vrf: {
                    label: i18n._('Vrf'),
                    type: 'select',
                    defaultText: 'Choose a VRF',
                    ngModel: 'vrf',
                    ngOptions: 'item as item.label for item in vrf_type_options',
                    ngDisabled: '!(user_obj.summary_fields.user_capabilities.edit || canAdd)',
                },
				vlan: {
                    label: i18n._('Vlan'),
                    type: 'select',
                    defaultText: 'Choose a VLAN',
                    ngModel: 'vlan',
                    ngOptions: 'item as item.label for item in vlan_type_options',
                    ngDisabled: '!(user_obj.summary_fields.user_capabilities.edit || canAdd)',
                },
				is_pool: {
                    label: i18n._('Is Pool'),
                    type: 'toggleSwitch',
                    toggleSource: 'is_pool',
                    dataTitle: i18n._('Is Pool'),
                    dataPlacement: 'right',
                    dataContainer: 'body',
                    awPopOver: "<p>" + i18n._("If enabled, Pool is enabled.") + "</p>",
                    ngDisabled: '!(user_obj.summary_fields.user_capabilities.edit || canAdd)'
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
            },
        };}];
