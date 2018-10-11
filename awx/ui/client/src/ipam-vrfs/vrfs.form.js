/*************************************************
 * Copyright (c) 2015 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/

  /**
 * @ngdoc function
 * @name forms.function:Datacenters
 * @description This form is for adding/editing ipam_rirs
*/

export default ['i18n', function(i18n) {
        return {

            addTitle: i18n._('NEW VRF'),
            editTitle: '{{ name }}',
            name: 'vrf',
            basePath: 'ipam_vrfs',
            // the top-most node of generated state tree
            stateTree: 'ipamVrfList',
            breadcrumbName: i18n._('IPAM VRF'),
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
                },
				rd: {
                    label: i18n._('Router Distinguisher'),
                    type: 'text',
                    ngDisabled: '!(user_obj.summary_fields.user_capabilities.edit || canAdd)',
                    required: true,
                },
				enforce_unique: {
                    label: i18n._('ENFORCE UNIQUE'),
                    type: 'toggleSwitch',
                    toggleSource: 'enforce_unique',
                    dataTitle: i18n._('Enforce Unique'),
                    dataPlacement: 'right',
                    dataContainer: 'body',
                    awPopOver: "<p>" + i18n._("If enabled, Enforce Unique is enabled.") + "</p>",
                    ngDisabled: '!(user_obj.summary_fields.user_capabilities.edit || canAdd)'
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
