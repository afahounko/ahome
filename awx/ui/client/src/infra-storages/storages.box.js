/*************************************************
 * Copyright (c) 2018 Ansible, Inc.
 *
 * All Rights Reserved
  *   Truegardener, ZhangYing
 *************************************************/

  /**
 * @ngdoc function
 * @name boxes.function:Apps
 * @description This form is for Boxes infra_apps
*/
export default ['Wait','GetBasePath','Rest','i18n', '$q', function(Wait,GetBasePath,Rest,i18n, $q) {
	var deferred = $q.defer();
	var defaultUrl = GetBasePath('ipam_infrastructure_ui');
	
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
    return JSON.parse(return_val).storages;
}];
