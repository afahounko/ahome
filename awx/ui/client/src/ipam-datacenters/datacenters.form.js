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

            addTitle: i18n._('NEW DATACENTER'),
            editTitle: '{{ name }}',
            name: 'datacenter',
            basePath: 'ipam_datacenters',
            // the top-most node of generated state tree
            stateTree: 'ipamDatacentersList',
            breadcrumbName: i18n._('IPAM DATACENTER'),
            showActions: true,
			tabs: {
				contacts: {
					index: 1,
					name: 'Contacts',
                    awToolTip: i18n._('Please save before assigning to organizations.'),
                    emptyListText: i18n._('Please add user to an Organization.'),
                    type: 'collection',
                    title: i18n._('Contacts'),
                    ngClick: 'select(1)',
				},
				comment: {
					index:2,
					name: 'Comment',
	                awToolTip: i18n._('Please save before assigning to organizations.'),
	                emptyListText: i18n._('Please add user to an Organization.'),
	                type: 'collection',
	                title: i18n._('Comment'),
                    ngClick: 'select(2)',
				}
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
		        site: {
                    label: i18n._('Site'),
                    type: 'text',
                    ngDisabled: '!(user_obj.summary_fields.user_capabilities.edit || canAdd)',
                    required: true,
					ngShow: 'tabId == 0',
                },
				location: {
                    label: i18n._('Location'),
                    type: 'text',
                    ngDisabled: '!(user_obj.summary_fields.user_capabilities.edit || canAdd)',
                    required: true,
					ngShow: 'tabId == 0',
                },
			    facility: {
                    label: i18n._('Facility'),
                    type: 'text',
                    ngDisabled: '!(user_obj.summary_fields.user_capabilities.edit || canAdd)',
					ngShow: 'tabId == 0',
                },
				contact_name: {
                    label: i18n._('Contact Name'),
                    type: 'text',
                    ngDisabled: '!(user_obj.summary_fields.user_capabilities.edit || canAdd)',
					ngShow: 'tabId == 1',
                },
				contact_phone: {
                    label: i18n._('Contact Phone'),
                    type: 'text',
                    ngDisabled: '!(user_obj.summary_fields.user_capabilities.edit || canAdd)',
					ngShow: 'tabId == 1',
                },
				contact_email: {
                    label: i18n._('Contact Email'),
                    type: 'email',
                    ngDisabled: '!(user_obj.summary_fields.user_capabilities.edit || canAdd)',
					ngShow: 'tabId == 1',
                },
				physical_address: {
                    label: i18n._('Physical Address'),
                    type: 'text',
                    ngDisabled: '!(user_obj.summary_fields.user_capabilities.edit || canAdd)',
					ngShow: 'tabId == 1',
                },
				shipping_address: {
                    label: i18n._('Shipping Address'),
                    type: 'text',
                    ngDisabled: '!(user_obj.summary_fields.user_capabilities.edit || canAdd)',
					ngShow: 'tabId == 1',
                },
				comments: {
                    label: i18n._('Comments'),
                    type: 'textarea',
					rows: 10,
               		ngTrim: false,
                    class: 'Form-formGroup--fullWidth',
                	elementClass: 'Form-monospace',
                    ngDisabled: '!(user_obj.summary_fields.user_capabilities.edit || canAdd)',
					ngShow: 'tabId == 2',
					awPopOver: i18n._('Please fill comment about Datacenter here.'),
					dataPlacement: 'right',
                	dataContainer: "body"
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
