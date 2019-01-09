/*************************************************
 * Copyright (c) 2018 Truegardener, Team.
 *
 * All Rights Reserved
 *************************************************/


 /**
 *  @ngdoc overview
 *  @name shared
 *  @description lib files
 *
 */
 /**
 *  @ngdoc function
 *  @name shared.function:provider-saver
 *  @description Save provider under the logic of Ansible.
 *  @ 1. Save inventory
 *  @ 2. Save Host according to inventory's id
 *  @ 3. Save Credentials from yml file.
 *  @ 4. Save Project for the provider
 *  @ 5. Save Job_Template using Project, inventory, credentials.
 *  @ 6. Post Provider with above info.
 *
 */


 
export default
angular.module('ProviderSaver', ['Utilities'])

.factory('cloudProcess', ['$http', 'GetBasePath', 'Rest', 'ProcessErrors', '$timeout',
	function ($http, GetBasePath, Rest, ProcessErrors, $timeout) {
        return function (form) {
        	$timeout(function(){
	        	if(form.cloud == true)
	        	{
	        		return '1';
	        	}
	        	else
	        	{
	        		return '0';
	        	}
			},2000);

        };
    }
])

.factory('SetActiveWizard', ['$http', 'GetBasePath', 'Rest', 'ProcessErrors', '$timeout',
	function ($http, GetBasePath, Rest, ProcessErrors, $timeout) {
        return function (scope, tabId) {
        	if (tabId == 1) {
				scope.status1 = "active";
				scope.status2 = "";
				scope.status3 = "";
				scope.status4 = "";
				scope.status5 = "";
			}
			else if (tabId == 2) {
				scope.status1 = "complete";
				scope.status2 = "active";
				scope.status3 = "";
				scope.status4 = "";
				scope.status5 = "";
			}
			else if (tabId == 3) {
				scope.status1 = "complete";
				scope.status2 = "complete";
				scope.status3 = "active";
				scope.status4 = "";
				scope.status5 = "";
			}
			else if (tabId == 4) {
				scope.status1 = "complete";
				scope.status2 = "complete";
				scope.status3 = "complete";
				scope.status4 = "active";
				scope.status5 = "";
				console.log('scope is ');
				console.log(scope);
				
			}
			else if (tabId == 5) {
				scope.status1 = "complete";
				scope.status2 = "complete";
				scope.status3 = "complete";
				scope.status4 = "complete";
				scope.status5 = "active";
			}
			return scope
        };
    }
])

.factory('GetOptsValues', ['$http', 'GetBasePath', 'Rest', 'ProcessErrors', '$timeout',
	function ($http, GetBasePath, Rest, ProcessErrors, $timeout) {
        return function (scope, form, fk_model, fk_type, prev_opts) {
			console.log('WizardProcessing');
			var fld, subid;
			var data = "{";
			if(prev_opts != undefined && prev_opts != null) //Edit Mode: Attach changed data to Previous OPTS
			{
				for (fld in prev_opts) {
					data += "'" + fld + "':";
					console.log(fld);
					console.log(form.fields[fld]);
					if(form.fields[fld] == undefined){
						data += "'" + prev_opts[fld] + "',\n";
					}
					else{
						if(form.fields[fld].type == 'select')
						{
							if(form.fields[fld].opt)
							{
								if(scope[fld] != undefined) data += "'" + scope[fld].label + "'";
					    		else data += "''";
					        }
					        else
					        {
					        	if(scope[fld] != undefined) data += "'" + scope[fld].value + "'";
					        	else data += "''";
					        }
					    	data += ",\n"; 
					    	continue;
						}
						if(form.fields[fld].type == 'sensitive')
						{
							data += "'$Encrypted$',\n";
					    	continue;
						}
						if(fld == "inventory_hosts" || fld == "instance_groups")
						{
							console.log(scope[fld]);
							if(scope[fld] != undefined && scope[fld] != '')
							{
								data += "'"
								for(subid in scope[fld]){
									data += scope[fld][subid].id + ',';
								}
								data = data.substring(0, data.length-1);
								data += "',"; 
							}
							else data += "'',";
							data+= "\n";
							continue;
						}
						if(fld != "opts")
						{
					    	if(scope[fld] != undefined) data += "'" + scope[fld] + "'";
					    	else data += "''";
					    	data += ",\n"; 
					    	
					    }
					}
				}
			}
			else	// Add Mode, 
			{
				for (fld in form.fields) {
					if(form.fields[fld].type == 'select')
					{
						data += "'" + fld + "':";
						if(form.fields[fld].opt)
						{
							if(scope[fld] != undefined) data += "'" + scope[fld].label + "'";
				    		else data += "''";
				        }
				        else
				        {
				        	if(scope[fld] != undefined) data += "'" + scope[fld].value + "'";
				        	else data += "''";
				        }
				    	data += ",\n"; 
				    	continue;
					}
					if(form.fields[fld].type == 'sensitive')
					{
						data += "'" + fld + "':'$Encrypted$',\n";
				    	continue;
					}
					if(fld == "inventory_hosts" || fld == "instance_groups")
					{
						data += "'" + fld + "':";
						console.log(scope[fld]);
						if(scope[fld] != undefined && scope[fld] != '')
						{
							data += "'"
							for(subid in scope[fld]){
								data += scope[fld][subid].id + ',';
							}
							data = data.substring(0, data.length-1);
							data += "',"; 
						}
						else data += "'',";
						data+= "\n";
						continue;
					}
					if(fld != "opts")
					{
				    	data += "'" + fld + "':";
				    	if(scope[fld] != undefined) data += "'" + scope[fld] + "'";
				    	else data += "''";
				    	data += ",\n"; 
				    	
				    }
				}
				data += "'fk_model':'"+ fk_model+ "',\n";
				data += "'fk_type':'" + fk_type + "'\n";
			}
			data += "}";
			console.log(data);
			return data;
        };
    }
])

.factory('initSelect', ['$http', 'GetBasePath', 'Rest', 'ProcessErrors',
	function ($http, GetBasePath, Rest, ProcessErrors) {
        return function (basePath, fixedData, filter, chooseID) {
		    var fld;
		    var resdata = [], filters = {};
		    if(fixedData != "")
		    {
		    	var datas = fixedData.split(',');
				for(var i in datas)
				{
	        		if(filter != null && filter != '')
	        		{
	        			for(var fld in filter)
	        			{
			                filters = filter[fld].split(',');
			                for (var ind = 0; ind < filters.length; ind++) {
			                	var sourceData = '' + datas[i];
		        				if (sourceData.toLowerCase().includes(filters[ind].toLowerCase()))
		        				{
		        					resdata.push({label:datas[i], value:i});
		        				}
			                }
	        			}
	        		}
	        		else
	        		{
	        			resdata.push({label:datas[i], value:i});
	        		}
	        	}
		    }
		    else
		    {
		    	Rest.setUrl(GetBasePath(basePath));
		        Rest.get().then(({data}) => {
					for(var i in data.results)
					{
		        		if(filter != null && filter != '')
		        		{
		        			for(var fld in filter)
		        			{
				                filters = filter[fld].split(',');
				                for (var ind = 0; ind < filters.length; ind++) {
				                	var sourceData = '' + data.results[i][fld];
			        				if (sourceData.toLowerCase().includes(filters[ind].toLowerCase()))
			        				{
			        					resdata.push({label:data.results[i].name, value:data.results[i].id});
			        				}
				                }
		        			}
		        		}
		        		else
		        		{
		        			resdata.push({label:data.results[i].name, value:data.results[i].id});
		        		}
		        	}
		        })
		    	.catch(({data, status}) => {
		        	ProcessErrors($scope, data, status, form, { hdr: i18n._('Error!'), msg: i18n._('Failed to Get Database for Select. Get returned status: ') + status });
				});
		    }
		    return resdata;
        };
    }
])

.factory('chooseSelect', [function () {
        return function (datas, index) {
        	console.log(datas);
        	var res_data;
			for (var i in datas) {
				console.log(i);
				console.log(datas[i]);
                if (('' + datas[i].value) === index) {
                	console.log('same here');
                    res_data = datas[i];
                    break;
                }
            }
            return res_data;
        };
    }
])

.factory('processExtras', ['$http', 
    function ($http) {
        return function (obj, form, prefix) {
		    var fld, subid;
		    var data = "{";
		    console.log(obj);
		    console.log(form);
		    for (fld in obj) {
		    	if(form.fields[fld] && fld != 'credential')
		    	{
			        if(form.fields[fld].type == 'select')
					{
						data += "'" + prefix + fld + "':";
						if(form.fields[fld].opt)
						{
							if(obj[fld] != undefined) data += "'" + obj[fld].label + "'";
				    		else data += "''";
				        }
				        else
				        {
				        	if(obj[fld] != undefined) data += "'" + obj[fld].value + "'";
				        	else data += "''";
				        }
				    	data += ",\n"; 
				    	continue;
					}
					if(form.fields[fld].type == 'sensitive')
					{
						data += "'" + prefix + fld + "':'$Encrypted$',\n";
				    	continue;
					}
					if(fld == "inventory_hosts" || fld == "instance_groups")
					{
						data += "'" + prefix + fld + "':";
						console.log(obj[fld]);
						if(obj[fld] != undefined && obj[fld] != '')
						{
							data += "'"
							for(subid in obj[fld]){
								data += obj[fld][subid].id + ',';
							}
							data = data.substring(0, data.length-1);
							data += "',"; 
						}
						else data += "'',";
						data+= "\n";
						continue;
					}
					if(fld != "opts")
					{
				    	data += "'" + prefix + fld + "':";
				    	if(obj[fld] != undefined) data += "'" + obj[fld] + "'";
				    	else data += "''";
				    	data += ",\n"; 
				    }
				}
				else
				{
					data += "'" + prefix + fld + "':";
			    	data += "'" + obj[fld] + "'";
			    	data += ",\n"; 
				}
		    }
		    data += "'extra_vars':''\n";
		    data += "}";
		    return data;
        };
    }
])


.factory('checkExistApi', ['$http', 'Rest', 
	function ($http, Rest) {
        return function (url, fld, fld_data) {
			Rest.setUrl(url);
            Rest.get().then(({ data }) => {
            	console.log(data);
            	var isSame = false;
            	var same_id = 0;
            	for(var item in data.results)
            	{
            		console.log(item);
            		if(data.results[item][fld] == fld_data)
            		{
            			console.log('Same field exists');
            			same_id = data.results[item].id;
            			isSame = true;
            			break;
            		}
            	}
            	if(isSame == true) return same_id;
            	else return -1;
            });
        };
    }
])

.factory('SaveInfraSubItem', ['$http', '$rootScope', '$state', '$location', 'Store', 'ProcessErrors', 'ReturnToCaller', 'i18n', 'GetBasePath', '$filter', 'Rest', 'Wait', 'Prompt', 'processExtras',
		function ($http, $rootScope, $state, $location, Store, ProcessErrors, ReturnToCaller, i18n, GetBasePath, $filter, Rest, Wait, Prompt, processExtras) {
        return function (parentData, url, form, data_subitem) {

            var fld, base, data = {}, data_project = {}, data_job = {};
            var new_project_id = 0, poweroff_id = 0, remove_id = 0;
            var scope = data_subitem;
            console.log(parentData);

			console.log(scope);
            Wait('start');
            
            var credents = [],
            poweroff_credents = [],
            remove_credents = [];

            console.log(data_subitem);
            if (data_subitem.multiCredential !== undefined && data_subitem.multiCredential !== null) {
                var cred_ids = {};

                cred_ids = data_subitem.multiCredential.split(',');
                console.log(cred_ids);
                for (var ind = 0; ind < cred_ids.length; ind++) {
                    var tmp_cred = {};
                    tmp_cred.id = parseInt(cred_ids[ind]);
                    credents.push(tmp_cred);
                    poweroff_credents.push(tmp_cred);
                    remove_credents.push(tmp_cred);
                }
            }
            var tmp_cred = {};
            tmp_cred.id = parseInt(parentData.opts.credential_id);
            credents.push(tmp_cred);
            poweroff_credents.push(tmp_cred);
            remove_credents.push(tmp_cred);
            console.log(credents);

            //Project Saving
            if (form.project) {
                data_project = form.project;
                data_project.name = data_project.name_prefix + scope.name;
            }
            else {
                data_project.name = form.configure_label_prefix + scope.name;
                data_project.description = "";
                data_project.scm_type = "git";
                data_project.scm_url = form.configure_project;
                data_project.scm_branch = "";
                data_project.scm_clean = true;
                data_project.scm_delete_on_update = true;
                data_project.credential = parentData.opts.credential_id;  //2018.10.27 get credential id from parent
                data_project.timeout = 0;
                data_project.organization = 1;
                data_project.scm_update_on_launch = true;
                data_project.scm_update_cache_timeout = 0;
            }
            console.log(data_project);

            console.log(credents);
            //defaultprojectUrl = GetBasePath('projects');
            //url = (base === 'teams') ? GetBasePath('teams') + $stateParams.team_id + '/projects/' : defaultprojectUrl;
            //console.log(url);
            Rest.setUrl(GetBasePath('projects'));
            Rest.post(data_project)
                .then(({ data }) => {
                    console.log(data);
                    new_project_id = data.id;
                    console.log('Project Updated Succeed : ' + new_project_id);
                    
                    //Check if the data_project created successfully or not. (here the status must be 'successful' when it created successfully)
                    var interval = setInterval(function () {
                        Rest.setUrl(GetBasePath('projects') + new_project_id + '/');
                        Rest.get().then(({ data }) => {
                        	console.log('Data get succeed');

                            if (data.status == 'successful') {
                            	data_subitem.project_id = new_project_id;
                            	var extra_vars = processExtras(data_subitem, form, "ahome_");

                            	console.log('Project status is succesful');
                                //**************************** Make Job_Template named Prefix as "Poweroff_" and "Remove_" ************
                                //************************************ Save Poweroff_JobTemplate **********************************
                                data_job = form.poweroff_job;
                                data_job.name = data_job.name_prefix + scope.name;
                                data_job.project = new_project_id;
                                data_job.inventory = parentData.opts.inventory_id;
                                data_job.extra_vars = extra_vars;

                                console.log(data_job);

                                Rest.setUrl(GetBasePath('job_templates'));
                                Rest.post(data_job)
                                    .then(({ data }) => {

                                        poweroff_id = data.id;
                                        Rest.setUrl(GetBasePath('job_templates') + data.id + '/credentials/');
                                        if (poweroff_credents !== null) {
                                            for (var fld in poweroff_credents) {
                                                Rest.post(poweroff_credents[fld]);
                                            }
                                        }
                                        //************************************ Save Remove_JobTemplate **********************************
                                        data_job = form.remove_job;
                                        data_job.name = data_job.name_prefix + scope.name;
                                        data_job.project = new_project_id;
                                        data_job.inventory = parentData.opts.inventory_id;
                                        data_job.extra_vars = extra_vars;

                                        console.log(data_job);

                                        Rest.setUrl(GetBasePath('job_templates'));
                                        Rest.post(data_job)
                                            .then(({ data }) => {

                                                remove_id = data.id;
                                                //Add multi credentials for poweroff
                                                Rest.setUrl(GetBasePath('job_templates') + data.id + '/credentials/');
                                                if (remove_credents !== null) {
                                                    for (var fld in remove_credents) {
                                                        Rest.post(remove_credents[fld]);
                                                    }
                                                }
                                                //************************************ Save Configure_JobTemplate **********************************
                                                data_job = form.configure_job;
                                                data_job.name = data_job.name_prefix + scope.name;
                                                data_job.project = new_project_id;
                                                data_job.inventory = parentData.opts.inventory_id;
												data_job.extra_vars = extra_vars;

                                                console.log(data_job);

                                                Rest.setUrl(GetBasePath('job_templates'));
                                                Rest.post(data_job)
                                                    .then(({ data }) => {
                                                        console.log('Job Template Post succeed');

                                                        var opts_field = "'project_id':'" + new_project_id + "',\n" + "'poweroff_id':'" + poweroff_id + "',\n" + "'remove_id':'" + remove_id + "',\n" + "'template_id':'" + data.id + "',\n";
                                                        data_subitem.project_id = new_project_id;
                                                        data_subitem.poweroff_id = poweroff_id;
                                                        data_subitem.remove_id = remove_id;
                                                        data_subitem.template_id = data.id;
                                                        
                                                        console.log(opts_field);
                                                        console.log(data_subitem);

                                                        //Add multi credentials for Configure Job
                                                        Rest.setUrl(GetBasePath('job_templates') + data.id + '/credentials/');
                                                        if (credents !== null) {
                                                            for (var fld in credents) {
                                                                Rest.post(credents[fld]);
                                                            }
                                                        }
                                                        console.log(url);
                                                        data.scm_type = "";
                                                        //data_subitem.opts = data_subitem.opts.slice(0, 1) + opts_field + data_subitem.opts.slice(1);
                                                        data_subitem.opts = processExtras(data_subitem, form, '');
                                                        //data_subitem.opts = data_subitem;
                                                        console.log(data_subitem);

                                                        //Save Job (Sub Items)

														Rest.setUrl(url);
														console.log(data_subitem);
                                                        Rest.post(data_subitem)
                                                            .then(({ data }) => {
                                                            	console.log(data);
                                                            	
                                                                base = $location.path().replace(/^\//, '').split('/')[0];
                                                                console.log(base);
                                                                if (base === 'ipam_infrastructure_jobs') {
                                                                    $rootScope.flashMessage = i18n._('New Job successfully created!');
                                                                    $rootScope.$broadcast("EditIndicatorChange", "Job", data.id);
																	Wait('stop');
                                                                    $state.go('infraJobsList', null, { reload: true });
                                                                } else {
                                                                    //ReturnToCaller(1);
                                                                }
                                                                console.log('InfraJob Post succeed');
                                                            })
                                                            .catch(({ data, status }) => {
                                                                ProcessErrors(null, data, status, form, { hdr: i18n._('Error!'), msg: i18n._('Failed to add new JOB_SUBITEM. POST returned status: ') + status });
                                                            });
                                                    })
                                                    .catch(({ data, status }) => {
                                                        Wait('stop');
                                                        ProcessErrors(null, data, status, form, {
                                                            hdr: i18n._('Error!'),
                                                            msg: i18n._('Failed to create new JOB TEMPLATE. POST returned status: ') + status
                                                        });
                                                    });
                                            })
                                            .catch(({ data, status }) => {
                                                Wait('stop');
                                                ProcessErrors(null, data, status, form, {
                                                    hdr: i18n._('Error!'),
                                                    msg: i18n._('Failed to create new REMOVE JOB TEMPLATE. POST returned status: ') + status
                                                });
                                            });

                                    })
                                    .catch(({ data, status }) => {
                                        Wait('stop');
                                        ProcessErrors(null, data, status, form, {
                                            hdr: i18n._('Error!'),
                                            msg: i18n._('Failed to create new POWER OFF JOB TEMPLATE. POST returned status: ') + status
                                        });
                                    });
                                clearInterval(interval);
                            }
                        })
                    }, 1000);
                    //****************************************************************************/

                    //defaultprojectUrl = GetBasePath('projects');
                    //url = (base === 'teams') ? GetBasePath('teams') + $stateParams.team_id + '/projects/' : defaultprojectUrl;
                    //console.log(url);
                    //})
                    //.catch(({data, status}) => {
                    //	ProcessErrors($scope, data, status, form, { hdr: i18n._('Error!'), msg: i18n._('Failed to Get Project ID. Get returned status: ') + status });
                    //});

                })
                .catch(({ data, status }) => {
                    Wait('stop');
                    ProcessErrors(null, data, status, form, {
                        hdr: i18n._('Error!'),
                        msg: i18n._('Failed to create new PROJECT. POST returned status: ') + status
                    });
                });
        };
    }
])


.factory('SaveFromCredential', ['$http', '$rootScope', '$state', '$location', '$q', 'Store', 'ProcessErrors', 'ReturnToCaller', 'i18n', 'GetBasePath', '$filter', 'Rest', 'Wait', 'Prompt', 'SaveInfraSubItem', 'processExtras', 'RollbackInfraSaving',
function ($http, $rootScope, $state, $location, $q, Store, ProcessErrors, ReturnToCaller, i18n, GetBasePath, $filter, Rest, Wait, Prompt, SaveInfraSubItem, processExtras, RollbackInfraSaving) {
	return function (url, cred_types, form, data_item, opts_field, ret_addr) {
        var new_credents = [], new_ssh_credential = 0, new_project_id = 0, poweroff_id = 0, remove_id = 0;
		var  data_project = {}, data_job = {}
        var credential_create_succeed = 0;
		var credential_data = [];
        
        console.log(cred_types);
        
        //Posting Multi Credential for the Provider
        for (var i = 0; i < cred_types.length; i++) {
        		console.log(data_item);
	    		credential_data[i] = {};
	        	credential_data[i].credential_type = cred_types[i];
	        	
	        	//if(cred_types[i]>1) credential_data[i].name = data_item.name;
	        	//else  credential_data[i].name = form.credential_prefix + data_item.name;
	        	credential_data[i].name = form.credential_prefix + data_item.name;

	            credential_data[i].description = data_item.description;
	            credential_data[i].user = 1;   // only for user type
	            credential_data[i].inputs = data_item.inputs;
	        	
	            Rest.setUrl(GetBasePath('credentials'));
		        Rest.post(credential_data[i])
	                .then(({data}) => {
	                	console.log('credential successfully created!!!' + data.id);
	                	new_credents.push(data);
	                	if(data_item.new_credents) data_item.new_credents = data_item.new_credents + ',' + data.id;
	                	else	data_item.new_credents = data.id;
	                	
	                	console.log(data_item.new_credents);
	                	
						opts_field = "'credential_id':'";
	                	opts_field = opts_field + data.id + ',';
	                	credential_create_succeed = credential_create_succeed + 1;
	                	if(credential_create_succeed == cred_types.length)	//All credentials are Created successfully.
	                	{
	                		new_ssh_credential = new_credents[0].id;
            				form.configure_job.cloud_credential = new_credents[0].id;
		                    form.remove_job.cloud_credential = new_credents[0].id;
		                    form.poweroff_job.cloud_credential = new_credents[0].id;
		                    
	                		for (var i = 0; i < new_credents.length; i++) {
	                			if(new_credents[i].credential_type == 1)
	                			{
	                				new_ssh_credential = new_credents[i].id;
	                				form.configure_job.credential = new_credents[i].id;
				                    form.remove_job.credential = new_credents[i].id;
				                    form.poweroff_job.credential = new_credents[i].id;
	                			}
	                		}

	                        console.log(opts_field);
	                        opts_field = opts_field.substring(0, opts_field.length-1);
	                        opts_field = opts_field + "',\n";
	                        opts_field = opts_field + "'new_ssh_credential':'" + new_ssh_credential + "',\n";
	                		data_item.opts = data_item.opts.slice(0, 1) + opts_field + data_item.opts.slice(1);
	                		console.log(data_item);
	                		
							//Project Posting 2018.11.7
			                data_project = form.project;
			                data_project.name = data_project.name_prefix + data_item.name;
				            Rest.setUrl(GetBasePath('projects'));
				            Rest.post(data_project)
				                .then(({ data }) => {
				                    console.log(data);
				                    opts_field = "'project_id':'" + data.id + "',\n";
				                    data_item.new_project = data.id;
									data_item.opts = data_item.opts.slice(0, 1) + opts_field + data_item.opts.slice(1);
									console.log(data_item.opts);
									
				                    new_project_id =  data.id;
				                    form.configure_job.project = data.id;
				                    form.remove_job.project = data.id;
				                    form.poweroff_job.project = data.id;
				                    console.log('Project Post Succeed : ' + new_project_id);
				                    
				                    //Check if the data_project created successfully or not. (here the status must be 'successful' when it created successfully)
				                    var interval = setInterval(function () {
				                        Rest.setUrl(GetBasePath('projects') + new_project_id + '/');
				                        Rest.get().then(({ data }) => {
				                        	console.log('Data get succeed');

				                            if (data.status == 'successful') {
				                            	var job_extra_vars = data_item.opts.split("\n'").join("\n'ahome_");
												job_extra_vars = job_extra_vars.replace("{'","{'ahome_");
												console.log(job_extra_vars);
												form.configure_job.extra_vars = job_extra_vars;
							                    form.remove_job.extra_vars = job_extra_vars;
							                    form.poweroff_job.extra_vars = job_extra_vars;
							                    
				                            	console.log('Project status is succesful');
				                                //**************************** Make Job_Template named Prefix as "Poweroff_" and "Remove_" ************
				                                //************************************ Save Poweroff_JobTemplate **********************************
				                                data_job = form.poweroff_job;
				                                data_job.name = data_job.name_prefix + data_item.name;

				                                console.log(data_job);

				                                Rest.setUrl(GetBasePath('job_templates'));
				                                Rest.post(data_job)
				                                    .then(({ data }) => {
														opts_field = "'poweroff_id':'" + data.id + "',\n";
														data_item.poweroff_id = data.id;
														data_item.opts = data_item.opts.slice(0, 1) + opts_field + data_item.opts.slice(1);

				                                        poweroff_id = data.id;
				                                        //Add multi credentials for poweroff
				                                        Rest.setUrl(GetBasePath('job_templates') + data.id + '/credentials/');
				                                        console.log(new_credents);
				                                        for (var i = 0; i < new_credents.length; i++)
				                                        {
				                                    		var tmp = {};
				                                    		tmp.id = new_credents[i].id;
				                                            Rest.post(tmp);
				                                        }
				                                        //************************************ Save Remove_JobTemplate **********************************

						                                data_job = form.remove_job;
						                                data_job.name = data_job.name_prefix + data_item.name;

				                                        console.log(data_job);

				                                        Rest.setUrl(GetBasePath('job_templates'));
				                                        Rest.post(data_job)
				                                            .then(({ data }) => {
															opts_field = "'remove_id':'" + data.id + "',\n";
															data_item.remove_id = data.id;
															data_item.opts = data_item.opts.slice(0, 1) + opts_field + data_item.opts.slice(1);
									
				                                                remove_id = data.id;
				                                                //Add multi credentials for poweroff
				                                                Rest.setUrl(GetBasePath('job_templates') + data.id + '/credentials/');
						                                        for (var i = 0; i < new_credents.length; i++)
						                                        {
						                                    		var tmp = {};
						                                    		tmp.id = new_credents[i].id;
						                                            Rest.post(tmp);
						                                        }
				                                                //************************************ Save Configure_JobTemplate **********************************

								                                data_job = form.configure_job;
								                                data_job.name = data_job.name_prefix + data_item.name;

				                                                console.log(data_job);

				                                                Rest.setUrl(GetBasePath('job_templates'));
				                                                Rest.post(data_job)
				                                                    .then(({ data }) => {
				                                                        console.log('Job Template Post succeed');
																		opts_field = "'template_id':'" + data.id + "'\n,";
																		data_item.template_id = data.id;
	            														data_item.opts = data_item.opts.slice(0, 1) + opts_field + data_item.opts.slice(1);
	            														
				                                                        //Add multi credentials for Configure Job
				                                                        Rest.setUrl(GetBasePath('job_templates') + data.id + '/credentials/');
								                                        for (var i = 0; i < new_credents.length; i++)
								                                        {
								                                    		var tmp = {};
								                                    		tmp.id = new_credents[i].id;
								                                            Rest.post(tmp);
								                                        }
												                		
											                			Rest.setUrl(url);
														                Rest.post(data_item)
															                .then(({data}) => {
															                	var parentData = data;
															                	console.log('Provider created!!!');
															                	console.log(form.subitem_auto);
															                	if(form.subitem_auto != undefined)
														                		{
														                			console.log('Subitem auto creating!!!');
														                			Rest.setUrl(GetBasePath('ipam_infrastructure_jobs_ui'));
				                        											Rest.get().then(({ data }) => {
				                        												console.log(data);
				                        												var boxes = [];
				                        												var cnt = 0;
				                        												for(var subboxes in data[parentData.related.opts.fk_model][parentData.related.opts.fk_type].boxes)
				                        												{
				                        													boxes[cnt] = subboxes;
				                        													cnt ++;
				                        												}
				                        												var loopval = 0;
				                        												//setTimeout( ()=> {
				                        												var subinterval = setInterval(function () {
				                        													console.log(boxes[loopval]);
																						    var data_subitem = {};
				                        													data_subitem = parentData.related.opts
				                        													data_subitem.name = data_item.name + '_auto_' + boxes[loopval];
				                        													data_subitem.id_type = boxes[loopval];
				                        													data_subitem.fk_id = parentData.id;
				                        													data_subitem.fk_type = parentData.related.opts.fk_type;
				                        													SaveInfraSubItem(parentData, GetBasePath('ipam_infrastructure_jobs'), data[parentData.related.opts.fk_model][parentData.related.opts.fk_type].boxes[boxes[loopval]], data_subitem);
				                        													loopval++;
				                        													if(loopval == cnt)
				                        													{
				                        														Wait('stop');
				                        														clearInterval(subinterval);
				                        													}
																						}, 10000); 
			                        													
			                        													//}, cnt * 5000);
				                        											});
														                		}
														                		//else
														                		//{
														                			console.log('No Subitem');
														                			var base = $location.path().replace(/^\//, '').split('/')[0];
														                			console.log(base);
																                    if (base.includes('ipam_')) {
																                    	Wait('stop');
																                        $rootScope.flashMessage = i18n._('New Provider successfully created!');
																                        $rootScope.$broadcast("EditIndicatorChange", "Provider", parentData.id);
																                        $state.go(ret_addr, null, { reload: true });
																                    } else {
																                        ReturnToCaller(1);
																                    }
																        //}
															                })
															                .catch(({data, status}) => {
				                                                				RollbackInfraSaving(data_item.new_inventory_id, data_item.new_host_id, data_item.new_credents , data_item.new_project, data_item.poweroff_id, data_item.remove_id, data_item.template_id);
															                    ProcessErrors(null, data, status, form, { hdr: i18n._('Error!'), msg: i18n._('Failed to add new Provider. POST returned status: ') + status });
															                });
				                                                    })
				                                                    .catch(({ data, status }) => {
				                                                        Wait('stop');
				                                                		RollbackInfraSaving(data_item.new_inventory_id, data_item.new_host_id, data_item.new_credents , data_item.new_project, data_item.poweroff_id, data_item.remove_id, '');
				                                                        ProcessErrors(null, data, status, form, {
				                                                            hdr: i18n._('Error!'),
				                                                            msg: i18n._('Failed to create new JOB TEMPLATE. POST returned status: ') + status
				                                                        });
				                                                    });
				                                            })
				                                            .catch(({ data, status }) => {
				                                                Wait('stop');
				                                                RollbackInfraSaving(data_item.new_inventory_id, data_item.new_host_id, data_item.new_credents , data_item.new_project, data_item.poweroff_id, '', '');
				                                                ProcessErrors(null, data, status, form, {
				                                                    hdr: i18n._('Error!'),
				                                                    msg: i18n._('Failed to create new REMOVE JOB TEMPLATE. POST returned status: ') + status
				                                                });
				                                            });

				                                    })
				                                    .catch(({ data, status }) => {
				                                        Wait('stop');
				                                        RollbackInfraSaving(data_item.new_inventory_id, data_item.new_host_id, data_item.new_credents , data_item.new_project, '', '', '');
				                                        ProcessErrors(null, data, status, form, {
				                                            hdr: i18n._('Error!'),
				                                            msg: i18n._('Failed to create new POWER OFF JOB TEMPLATE. POST returned status: ') + status
				                                        });
				                                    });
				                                clearInterval(interval);
				                            }
				                        })
				                    }, 1000);
				                })
				                .catch(({ data, status }) => {
				                    Wait('stop');
				                    RollbackInfraSaving(data_item.new_inventory_id, data_item.new_host_id, data_item.new_credents , '', '', '', '');
				                    ProcessErrors(null, data, status, form, {
				                        hdr: i18n._('Error!'),
				                        msg: i18n._('Failed to create new PROJECT. POST returned status: ') + status
				                    });
				                });
	                	}
			            //opts_field = opts_field + data.id + ',';
	            })
	        	.catch(({ data, status }) => {
	                Wait('stop');
	                RollbackInfraSaving(data_item.new_inventory_id, data_item.new_host_id, '', '', '', '', '');
	                ProcessErrors(null, data, status, form, {
	                    hdr: i18n._('Error!'),
	                    msg: i18n._('Failed to create new Credential. POST returned status: ') + status
	                });
	            });
		}
	};
}
])

.factory('SaveInfraItem', ['$http', '$rootScope', '$state', '$location', '$timeout', '$q', 'Store', 'ProcessErrors', 'ReturnToCaller', 'i18n', 'GetBasePath', '$filter', 'Rest', 'Wait', 'Prompt', 'SaveInfraSubItem', 'processExtras', 'SaveFromCredential', 'RollbackInfraSaving', 'checkExistApi',
function ($http, $rootScope, $state, $location, $timeout, $q, Store, ProcessErrors, ReturnToCaller, i18n, GetBasePath, $filter, Rest, Wait, Prompt, SaveInfraSubItem, processExtras, SaveFromCredential, RollbackInfraSaving, checkExistApi) {
        return function (url, form, data_item, ret_addr) {
			var fld, data = {};
			var inventory_data = {}, host_data = {}, credential_type_data = {}, cred_types = {};
			var opts_field, new_inventory_id = 0, new_host_id = 0;
            //if(id_type == "vmware_vcenter")   // for now it is for Vmwarevcenter
            //{
			    Wait('start');

				//Posting Inventory for this provider
	            inventory_data.name = data_item.name + ' Inventory';
	            inventory_data.organization = 1;
        		Rest.setUrl(GetBasePath('inventory'));
                Rest.post(inventory_data)
                	.then(({data}) => {

						new_inventory_id =  data.id;
						data_item.new_inventory_id = data.id;
			        	form.configure_job.inventory =  data.id;
			        	form.remove_job.inventory =  data.id;
			        	form.poweroff_job.inventory =  data.id;
			        	
			        	opts_field = "'inventory_id':'" + data.id + "',\n";
                		data_item.opts = data_item.opts.slice(0, 1) + opts_field + data_item.opts.slice(1);
				        
				        host_data.name = data_item.name.toLowerCase() + '_endpoint';
				        host_data.inventory = data.id;
				        if(!data_item.windows_options) host_data.variables = 'ansible_connection: local';
				        else host_data.variables = data_item.windows_options;
				        	
				        
				        //Posting Host for this provider using Inventory posted above 2018/11/7
				        Rest.setUrl(GetBasePath('hosts'));
		                Rest.post(host_data)
		                	.then(({data}) => {
		                		new_host_id = data.id;
		                		opts_field = "'host_id':'" + data.id + "',\n";
		                		data_item.new_host_id = data.id;
		                		data_item.opts = data_item.opts.slice(0, 1) + opts_field + data_item.opts.slice(1);
						        
						        console.log(form);
						        
						        //Checking credential_type and post a new if c_t is custom
						        if(form.cloud == false)
						        {
						        	console.log(data_item);
									if(form.credential_type == 'BuildFactory' || form.credential_type == 'Linux'){	//credential_type is machine
										cred_types = ("1").split(',');	//Set credential_type to machine
						        		SaveFromCredential(url, cred_types, form, data_item, opts_field, ret_addr);
									}
									else		//credential_type is custom (need to create a new credential_type with customized form)
									{
										//Create a new credential_type.
										credential_type_data.name = form.credential_type;
										credential_type_data.kind = 'cloud';
										credential_type_data.inputs = form.credential_input;
										//credential_type_data.
										var exist_id;
							            var isSame = false;
										//while(exist_id == undefined)
										//{

										Rest.setUrl(GetBasePath('credential_types'));
							            Rest.get().then(({ data }) => {
							            	console.log(data);
							            	for(var item in data.results)
							            	{
							            		console.log(item);
							            		if(data.results[item]['name'] == form.credential_type)
							            		{
							            			console.log('Same field exists');
							            			exist_id = data.results[item].id;
							            			isSame = true;
							            			break;
							            		}
							            	}
											console.log(exist_id);
							            	if(isSame == true)
							            	{
							            	 	console.log('credential_type already exists');
												cred_types = ('' + exist_id).split(',');	//Set credential_type to machine
							        			SaveFromCredential(url, cred_types, form, data_item, opts_field, ret_addr);
							            	}
							            	else{
							            		console.log('credential_type not exists');
												Rest.setUrl(GetBasePath('credential_types'));
							                	Rest.post(credential_type_data)
							                	.then(({data}) => {
							                		cred_types = ('' + data.id).split(',');	//Set credential_type to machine
							        				SaveFromCredential(url, cred_types, form, data_item, opts_field, ret_addr);
							        			});
							            	}
										});
									}
						        }
						        else
						        {
	    							cred_types = form.credential_types.split(',');
						        	SaveFromCredential(url, cred_types, form, data_item, opts_field, ret_addr);
						        }
			            	})
				        	.catch(({ data, status }) => {
			                    Wait('stop');
			                    RollbackInfraSaving(new_inventory_id, '', '', '', '', '', '');
			                    ProcessErrors(null, data, status, form, {
			                        hdr: i18n._('Error!'),
			                        msg: i18n._('Failed to create new Host. POST returned status: ') + status
			                    });
			                });
			        })
		        	.catch(({ data, status }) => {
	                    Wait('stop');
	                    ProcessErrors(null, data, status, form, {
	                        hdr: i18n._('Error!'),
	                        msg: i18n._('Failed to create new Inventory. POST returned status: ') + status
	                    });
	                });
        };
    }
])

.factory('RollbackInfraSaving', ['$http', '$rootScope', '$state', 'Store', 'ProcessErrors', 'i18n', 'GetBasePath', '$filter', 'Rest', 'Wait', 'Prompt', 'DeleteSubJobTemplate',
	function ($http, $rootScope, $state, Store, ProcessErrors, i18n, GetBasePath, $filter, Rest, Wait, Prompt, DeleteSubJobTemplate) {
        return function (new_inventory_id, new_host_id, new_credents, new_project_id, poweroff_id, remove_id, configure_id) {
	        	$('#prompt-modal').modal('hide');
                Wait('start');
                //Remove Provider related Subitems
				
				
				//Remove Related Configure
        		if(configure_id){
        			Rest.setUrl(GetBasePath('job_templates') + configure_id + '/');
        			Rest.destroy()
        			.then(() => {
        				console.log('related host deleted successfully');
        			});
        		}
				//Remove Related Remove Job
        		if(remove_id){
        			Rest.setUrl(GetBasePath('job_templates') + remove_id + '/');
        			Rest.destroy()
        			.then(() => {
        				console.log('related remove_id deleted successfully');
        			});
        		}
				//Remove Related Poweroff Job
        		if(poweroff_id){
        			Rest.setUrl(GetBasePath('job_templates') + poweroff_id + '/');
        			Rest.destroy()
        			.then(() => {
        				console.log('related poweroff_id deleted successfully');
        			});
        		}
				//Remove Related Project
        		if(new_project_id){
        			Rest.setUrl(GetBasePath('projects') + new_project_id + '/');
        			Rest.destroy()
        			.then(() => {
        				console.log('related new_project_id deleted successfully');
        			});
        		}
				//Remove Related Credentials
        		if(new_credents){
					var creds = {};
        			creds = ('' + new_credents).split(',');
        			for (var i = 0; i < creds.length; i++) {
            			Rest.setUrl(GetBasePath('credentials') + creds[i] + '/');
		                Rest.destroy()
		                    .then(() => {
		                        console.log('related credential deleted successfully ' + i);
		                    });
		            }
        		}
                //Remove Related Host
        		if(new_host_id){
        			Rest.setUrl(GetBasePath('hosts') + new_host_id + '/');
        			Rest.destroy()
        			.then(() => {
        				console.log('related host deleted successfully');
        			});
        		}
                //Remove Related Inventory
        		if(new_inventory_id){
        			Rest.setUrl(GetBasePath('inventory') + new_inventory_id + '/');
        			Rest.destroy()
        			.then(() => {
        				console.log('related inventory deleted successfully');
        			});
        		}
            	return true;
	     };
    }
])

.factory('LaunchRelatedJobTemplate', ['$http', '$rootScope', 'Store', 'ProcessErrors', 'i18n', '$state', '$filter', 'Rest', 'Wait', 'Prompt', 'JobTemplateModel', 'WorkflowJobTemplateModel',
    function ($http, $rootScope, Store, ProcessErrors, i18n, $state, $filter, Rest, Wait, Prompt, JobTemplate, WorkflowJobTemplateModel) {
        return function (url, id, name, template_kind, confirmDialog, confirmName) {
	        var action = function() {
	        	$('#prompt-modal').modal('hide');
				console.log("Launch Job_Template");
	            Wait('start');
	            Rest.setUrl(url + id);
	            Rest.get(url + id).then(({data}) => {
	            	var job_template_id = data.opts[template_kind];
	            	const jobTemplate = new JobTemplate();
	            	const selectedJobTemplate = jobTemplate.create();
	            	
		            const preLaunchPromises = [
		                selectedJobTemplate.getLaunch(job_template_id),
		                selectedJobTemplate.optionsLaunch(job_template_id),
		            ];
		            Promise.all(preLaunchPromises)
		                .then(([launchData, launchOptions]) => {
		                    if (selectedJobTemplate.canLaunchWithoutPrompt()) {
		                        selectedJobTemplate
		                            .postLaunch({ id: job_template_id })
		                            .then(({ data }) => {
		                                $state.go('output', { id: data.job, type: 'playbook' }, { reload: true });
		                            });
		                    } else {
		                        const promptData = {
		                            launchConf: launchData.data,
		                            launchOptions: launchOptions.data,
		                            template: job_template_id,
		                            templateType: 'job_template',
		                            prompts: PromptService.processPromptValues({
		                                launchConf: launchData.data,
		                                launchOptions: launchOptions.data
		                            }),
		                            triggerModalOpen: true
		                        };

		                        if (launchData.data.survey_enabled) {
		                            selectedJobTemplate.getSurveyQuestions(job_template_id)
		                                .then(({ data }) => {
		                                    const processed = PromptService.processSurveyQuestions({
		                                        surveyQuestions: data.spec
		                                    });
		                                    promptData.surveyQuestions = processed.surveyQuestions;
		                                    //vm.promptData = promptData;
		                                });
		                        } else {
		                            //vm.promptData = promptData;
		                        }
		                    }
		                });
	 			})
	            .catch(({data, status}) => {
					ProcessErrors(null, data, status, null, {
		                    hdr: i18n._('Error!'),
		                    msg: i18n.sprintf(i18n._('Failed to retrieve Job: %s. GET status: '), id) + status
		                });
	            });
	    	};
	    	if(confirmDialog == 1)
	    	{
		    	Prompt({
	                hdr: i18n._(confirmName),
	                resourceName: $filter('sanitize')(name),
	                body: '<span class="Prompt-bodyQuery">' + i18n._('Are you sure you want to ' + confirmName + ' ') + '<span class="Modal-titleResourceName">' + $filter('sanitize')(name) + '</span>' + i18n._('?') + '</span>',
	                action: action,
	                actionText: i18n._(confirmName)
	            });
	        }
	        else
	        {
	        	action();
	        }
        };
        
    }
])

.factory('DeleteSubJobTemplate', ['$http', '$rootScope', '$state', 'Store', 'ProcessErrors', 'i18n', 'GetBasePath', '$filter', 'Rest', 'Wait', 'Prompt', 
    function ($http, $rootScope, $state, Store, ProcessErrors, i18n, GetBasePath, $filter, Rest, Wait, Prompt) {
        return function (url, id, name, confirmDialog) {
            var action = function() {
            	var project_id, template_id, poweroff_id, remove_id;
                $('#prompt-modal').modal('hide');
                Wait('start');
                Rest.setUrl(url + id);
                Rest.get(url + id).then(({data}) => {
                	console.log(data);
                	project_id = data.opts.project_id;
                	template_id = data.opts.template_id;
                	poweroff_id = data.opts.poweroff_id;
                	remove_id = data.opts.remove_id;
                	console.log(project_id);
					console.log(template_id);
					Rest.setUrl(GetBasePath('projects') + project_id + '/');
	                Rest.destroy()
	                    .then(() => {
	                    })
	                    .catch(({data, status}) => {
	                        console.log('delete Project failed');
	                    });

		            Rest.setUrl(GetBasePath('job_templates') + template_id + '/');
	                Rest.destroy()
	                    .then(() => {
	                    })
	                    .catch(({data, status}) => {
	                        console.log('delete JobTemplate + templateid failed');
	                    });
	                    
		            Rest.setUrl(GetBasePath('job_templates') + poweroff_id + '/');
	                Rest.destroy()
	                    .then(() => {
	                    })
	                    .catch(({data, status}) => {
	                        console.log('delete JobTemplate + poweroff_id failed');
	                    });
	                    
		            Rest.setUrl(GetBasePath('job_templates') + remove_id + '/');
	                Rest.destroy()
	                    .then(() => {
	                    })
	                    .catch(({data, status}) => {
	                        console.log('delete JobTemplate + remove_id failed');
	                    });
	                    
	                Rest.setUrl(url + id + '/');
	                Rest.destroy()
	                    .then(() => {
	                        let reloadListStateParams = null;
							
	                        if($state.params.job_search && !_.isEmpty($state.params.job_search.page) && $state.params.job_search.page !== '1') {
	                            reloadListStateParams = _.cloneDeep($state.params);
	                            reloadListStateParams.job_search.page = (parseInt(reloadListStateParams.job_search.page)-1).toString();
	                        }
	                        if (parseInt($state.params.job_id) === id) {
	                            $state.go('^', null, { reload: true });
	                        } else {
	                            $state.go('.', null, { reload: true });
	                        }
	                    })
	                    .catch(({data, status}) => {
	                        ProcessErrors(null, data, status, null, {
	                            hdr: i18n._('Error!'),
	                            msg: i18n.sprintf(i18n._('Call to %s failed. DELETE returned status: '), url) + status
	                        });
	                    });
                })
	            .catch(({data, status}) => {
	                ProcessErrors(null, data, status, null, {
	                    hdr: i18n._('Error!'),
	                    msg: i18n.sprintf(i18n._('Failed to retrieve App: %s. GET status: '), id) + status
	                });
	            });
            };
			if(confirmDialog == 1)
	    	{
	            Prompt({
	                hdr: i18n._('Delete'),
	                resourceName: $filter('sanitize')(name),
	                body: '<div class="Prompt-bodyQuery">' + i18n._('Are you sure you want to delete this Job?') + '</div>',
	                action: action,
	                actionText: i18n._('DELETE')
	            });
	        }
	        else
	        {
	        	action();
	        }
        };
    }
])

.factory('DeleteInfrastructure', ['$http', '$rootScope', '$state', 'Store', 'ProcessErrors', 'i18n', 'GetBasePath', '$filter', 'Rest', 'Wait', 'Prompt', 'DeleteSubJobTemplate',
	function ($http, $rootScope, $state, Store, ProcessErrors, i18n, GetBasePath, $filter, Rest, Wait, Prompt, DeleteSubJobTemplate) {
        return function (url, id, name, fk_model, fk_type) {
        	var action = function() {
	        	$('#prompt-modal').modal('hide');
                Wait('start');
                //Remove Provider related Subitems

                Rest.setUrl(GetBasePath('ipam_infrastructure_jobs'));
                Rest.get().then(({data}) => {
                	console.log(data);
                	for(var job in data.results)
		            {
		            	console.log(data.results[job]);
		            	console.log(id);
		            	console.log(fk_model);
		            	console.log(fk_type);
		            	if(data.results[job]['fk_model'] === fk_model && data.results[job]['fk_type'] === fk_type && data.results[job]['fk_id'] === '' + id)
		            	{
		            		console.log("true here");
		            		DeleteSubJobTemplate(GetBasePath('ipam_infrastructure_jobs'), data.results[job].id, data.results[job].name, 0);
		            	}
		            }
                });
                
                //Remove Provider
                Rest.setUrl(url + id);
                Rest.get(url + id).then(({data}) => {
                	var obj = data.opts;
                	console.log(obj);
                	//Remove Project
					if(obj.project_id){
						Rest.setUrl(GetBasePath('projects') + obj.project_id + '/');
		                Rest.destroy()
            			.then(() => {
            				console.log('related project deleted successfully');
            			});
		            }
		            
					//Remove Configure_Job_Template
		            if(obj.template_id){
			            Rest.setUrl(GetBasePath('job_templates') + obj.template_id + '/');
		                Rest.destroy()
            			.then(() => {
            				console.log('related Configure_Job_Template deleted successfully');
            			});
	                }
	                
	                //Remove Poweroff_Job_Template
		            if(obj.poweroff_id){
			            Rest.setUrl(GetBasePath('job_templates') + obj.poweroff_id + '/');
		                Rest.destroy()
            			.then(() => {
            				console.log('related Poweroff_Job_Template deleted successfully');
            			});
	                }
	                
	                //Remove Remove_Job_Template
		            if(obj.remove_id){
			            Rest.setUrl(GetBasePath('job_templates') + obj.remove_id + '/');
		                Rest.destroy()
            			.then(() => {
            				console.log('related Remove_Job_Template deleted successfully');
            			});
                    }
                    
                    //Remove Related Inventory
            		if(obj.inventory_id){
            			Rest.setUrl(GetBasePath('inventory') + obj.inventory_id + '/');
            			Rest.destroy()
            			.then(() => {
            				console.log('related inventory deleted successfully');
            			});
            		}
            		
            		//Remove related Credential
            		if(obj.credential_id){
            			var cred_types = {};
            			cred_types = obj.credential_id.split(',');
            			for (var i = 0; i < cred_types.length; i++) {
                			Rest.setUrl(GetBasePath('credentials') + cred_types[i] + '/');
			                Rest.destroy()
			                    .then(() => {
			                        console.log('related credential deleted successfully ' + i);
			                    });
			            }
            		}
		            //Remove Configure_Job_Template
		            Rest.setUrl(url + id + '/');
		            Rest.destroy()
		                .then(() => {
		                    let reloadListStateParams = null;
		                    if($state.params.provider_search && !_.isEmpty($state.params.provider_search.page) && $state.params.provider_search.page !== '1') {
		                        reloadListStateParams = _.cloneDeep($state.params);
		                        reloadListStateParams.provider_search.page = (parseInt(reloadListStateParams.provider_search.page)-1).toString();
		                    }

		                    if (parseInt($state.params.provider_id) === id) {
		                        $state.go('^', null, { reload: true });
		                    } else {
		                        $state.go('.', null, { reload: true });
		                    }
		                })
		                .catch(({data, status}) => {
		                    ProcessErrors(null, data, status, null, {
		                        hdr: i18n._('Error!'),
		                        msg: i18n.sprintf(i18n._('Call to %s failed. DELETE returned status: '), url) + status
		                    });
		                });
            		return true;
	 			})
	            .catch(({data, status}) => {
					ProcessErrors(null, data, status, null, {
		                    hdr: i18n._('Error!'),
		                    msg: i18n.sprintf(i18n._('Failed to retrieve %s: %s. GET status: '), url, id) + status
		                });
		            return false;
	            });
	            return false;
	        };
			Prompt({
                hdr: i18n._('Delete'),
                resourceName: $filter('sanitize')(name),
                body: '<span class="Prompt-bodyQuery">' + i18n._('Are you sure you want to Delete ') + '<span class="Modal-titleResourceName">' + $filter('sanitize')(name) + '</span>' + i18n._('?') + '</span>',
                action: action,
                actionText: i18n._('Delete')
            });
        };
    }
])

.factory('processRow', ['$rootScope', '$stateParams', 'Store', 'LoadBasePaths', 'Empty', 'PromptService', 'GetBasePath', 'Rest', 'Wait', 'i18n', 'ProcessErrors',
    function ($rootScope, $stateParams, Store, LoadBasePaths, Empty, JobTemplate, GetBasePath, Rest, Wait, i18n, ProcessErrors) {
        return function (url, obj) {
            // use /api/v2/ results to construct API URLs.
            console.log('Process ' + url);
            Wait('start');
            Rest.setUrl(GetBasePath(url) + obj.id);
            Rest.get(GetBasePath(url) + obj.id).then(({data}) => {
            	var template_id = data.opts.template_id;
            	console.log(data);
            	Rest.setUrl(GetBasePath('job_templates') + template_id);
            	Rest.get(GetBasePath('job_templates') + template_id).then(({data}) => {
            		console.log(data);
            		if(data.summary_fields.last_job.status == 'successful')
            		{
	            		obj.tool_tip = i18n._('Most recent job Succeed. Click to view job script.');
				    }
				    else
				    {
	            		obj.tool_tip = i18n._('Most recent job Failed. Click to view job script.');
				    }
				    obj.job_status = data.summary_fields.last_job.status;
				    obj.last_id = data.summary_fields.last_job.id;
				    console.log(obj);

			        return obj;
	 			})
	            .catch(({data, status}) => {
	            	obj.tool_tip = i18n._('Most recent job failed. Click to view jobs.');;
	            	obj.job_status = 'pending';
	            	console.log(obj);
	            	return obj;
	            });
 			})
            .catch(({data, status}) => {
                ProcessErrors(null, data, status, null, {
                    hdr: i18n._('Error!'),
                    msg: i18n.sprintf(i18n._('Failed to retrieve Job: %s. GET status: '), $stateParams.id) + status
                });
                console.log(obj);
                return obj;
            });
        };
    }
]);
