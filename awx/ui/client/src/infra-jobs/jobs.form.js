/*************************************************
 * Copyright (c) 2015 Ansible, Inc.
 *
 * All Rights Reserved
   *   Truegardener, ZhangYing
 *************************************************/

  /**
 * @ngdoc function
 * @name forms.function:Apps
 * @description This form is for adding/editing infra_apps
*/

export default ['$rootScope','Wait','GetBasePath','Rest','i18n', '$q', function($rootScope,Wait,GetBasePath,Rest,i18n, $q) {
	let category, subitem;
	let formss = [], box = [], data = [];
	var deferred = $q.defer();
	var defaultUrl = GetBasePath('ipam_infrastructure_jobs_ui');

	var return_val = null;
	var formData = new FormData();
	formData.append("param", "");

	var request = new XMLHttpRequest();
    request.open("GET", defaultUrl, false);
    request.onload = function () {
	    if (request.readyState === request.DONE) {
	        if (request.status === 200) {
	        	return_val = request.response;
	        }
	    }
	};
    request.send(formData);
    let box_data = [];
    box_data = JSON.parse(return_val);

    console.log("JOBS FORM");
    for(category in box_data)
    {
    	for(subitem in box_data[category])
    	{
    		for(box in box_data[category][subitem].boxes)
    		{
		    	formss[box] = box_data[category][subitem].boxes[box];
    		}
    	}
    }
    console.log(formss);
	return formss;
}];
