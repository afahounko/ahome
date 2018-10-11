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

            addTitle: i18n._('NEW RIR'),
            editTitle: '{{ name }}',
            name: 'rir',
            basePath: 'ipam_rirs',
            // the top-most node of generated state tree
            stateTree: 'ipamRirsList',
            breadcrumbName: i18n._('IPAM RIR'),
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
			    registry: {
                    label: i18n._('Registry'),
                    type: 'text',
                    ngDisabled: '!(user_obj.summary_fields.user_capabilities.edit || canAdd)',
                    required: true,
                },
				region: {
                    label: i18n._('Region'),
                    type: 'text',
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
