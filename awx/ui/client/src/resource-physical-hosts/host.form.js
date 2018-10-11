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

            addTitle: i18n._('NEW BARE METAL'),
            editTitle: '{{ name }}',
            name: 'baremetal',
            basePath: 'ipam_bare_metals',
            // the top-most node of generated state tree
            stateTree: 'resourcePhysicalHostsList',
            breadcrumbName: i18n._('IPAM BARE METALS'),
        	showActions: true,
			tabs: {
				options: {
					index: 1,
					name: 'Options',
                    type: 'collection',
                    title: i18n._('Options'),
                    ngClick: 'select(1)',
				},
			},
            fields: {
                name: {
                    label: i18n._('Name'),
                    type: 'text',
                    ngDisabled: '!(user_obj.summary_fields.user_capabilities.edit || canAdd)',
                    required: true,
					ngShow: 'tabId == 0',
                },
			    description: {
                    label: i18n._('Description'),
                    type: 'text',
                    ngDisabled: '!(user_obj.summary_fields.user_capabilities.edit || canAdd)',
					ngShow: 'tabId == 0',
                },
				model: {
                    label: i18n._('Model'),
                    type: 'text',
                    ngDisabled: '!(user_obj.summary_fields.user_capabilities.edit || canAdd)',
					ngShow: 'tabId == 0',
                },
			    fqdn: {
                    label: i18n._('FQDN'),
                    type: 'text',
                    ngDisabled: '!(user_obj.summary_fields.user_capabilities.edit || canAdd)',
					ngShow: 'tabId == 0',
                },
				sn: {
                    label: i18n._('Serial Number'),
                    type: 'text',
                    ngDisabled: '!(user_obj.summary_fields.user_capabilities.edit || canAdd)',
					ngShow: 'tabId == 0',
                },
				datacenter: {
                    label: i18n._('Datacenter'),
                    type: 'select',
                    defaultText: 'Choose a Datacenter',
                    ngModel: 'datacenter',
                    ngOptions: 'item as item.label for item in datacenter_type_options',
                    ngDisabled: '!(user_obj.summary_fields.user_capabilities.edit || canAdd)',
                    required: true,
					ngShow: 'tabId == 0',
                },
				credential: {
                    label: i18n._('Credential'),
                    type: 'select',
                    defaultText: 'Choose a Credential',
                    ngModel: 'credential',
                    ngOptions: 'item as item.label for item in credential_type_options',
                    ngDisabled: '!(user_obj.summary_fields.user_capabilities.edit || canAdd)',
                    required: true,
					ngShow: 'tabId == 0',
                },
				primary_ip: {
                    label: i18n._('Primary IPv4'),
                    type: 'text',
                    ngDisabled: '!(user_obj.summary_fields.user_capabilities.edit || canAdd)',
					ngShow: 'tabId == 0',
                },
				primary_ip6: {
                    label: i18n._('Primary IPv6'),
                    type: 'text',
                    ngDisabled: '!(user_obj.summary_fields.user_capabilities.edit || canAdd)',
					ngShow: 'tabId == 0',
                },
				primary_mac: {
                    label: i18n._('MAC Address'),
                    type: 'text',
                    ngDisabled: '!(user_obj.summary_fields.user_capabilities.edit || canAdd)',
					ngShow: 'tabId == 0',
                },
				primary_domain: {
                    label: i18n._('Domain Address'),
                    type: 'text',
                    ngDisabled: '!(user_obj.summary_fields.user_capabilities.edit || canAdd)',
					ngShow: 'tabId == 0',
                },
				opts: {
                    label: i18n._('Input Opts'),
                    class: 'Form-textAreaLabel Form-formGroup--fullWidth',
	                type: 'textarea',
	                rows: 6,
	                default: '---',
	                showParseTypeToggle: true,
	                parseTypeName: 'parseTypeOpts',
	                awPopOverWatch: "opts_help_text",
	                dataTitle: i18n._('Input Opts'),
	                dataPlacement: 'right',
	                dataContainer: "body",
	                id: 'opts',
                    ngDisabled: '!(user_obj.summary_fields.user_capabilities.edit || canAdd)',
					ngShow: 'tabId == 1',
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
