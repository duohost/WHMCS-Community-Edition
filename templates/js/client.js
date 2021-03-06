/**********************************************
 
 *** SoluteDNS CE for WHMCS ***
 
 File:					template/js/client.js
 File version:			0.18.001
 Date:					21-04-2018
 
 Copyright (C) NetDistrict 2016-2018
 All Rights Reserved
 
 **********************************************/

function sendData(json) {

	NProgress.start();

	if (typeof time1 !== 'undefined') {
		clearTimeout(time1);
	}
	if (typeof time2 !== 'undefined') {
		clearTimeout(time2);
	}

	$.ajax({
		data: {
			'data': json
		},
		url: setDataURL() + 'index.php?m=solutedns&action=post',
		method: "POST",
		cache: false,
		success: function (data) {

			var result = JSON.parse(data);

			if (result) {
				result.forEach(function (data) {

					setMessage(data['title'], data['msg'], data['status'], data['tablereload'], data['pagereload'], data['fieldreset'], data['msgReset'], data['fixed'], data['errorFields'])

					if (data['syscheck'] == true) {
						syscheck();
					}

					if (typeof data['field'] !== 'undefined') {
						setErrorField(data['field']);
					}

				});
			}

			NProgress.done();

		},
		error: function () {
			alert('Failed to load notifications.\nPlease try to refresh this page.')
		},

	});

}

function setMessage(title, desc, status, tableReload, pageReload, fieldReset, msgReset, fixed, errorFields) {

	/* Message Reset */
	if (msgReset == true) {
		resetMessages();
	}

	/* Generate Unique ID */
	var id = '4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});

	/* Set message state */
	if (status == 'error') {
		var state = 'alert2 alert2-danger';
	} else {
		var state = 'alert2 alert2-' + status;
	}

	/* Add Message */
	$('#msgConsole').append('<div id=' + id + ' style="display: none;" class="' + state + '"><div><h4>' + title + '</h4></div><div><p>' + desc + '</p></div></div>');

	/* Display Message */
	$("#" + id).show("slow", function () {
		$('html, body').animate({
			scrollTop: $("#msgConsole").offset().top - 10
		}, 400);
		if (fixed != true) {
			setTimeout(function () {
				$("#" + id).hide("slow");
			}, 8000);
			setTimeout(function () {
				$("#" + id).remove();
			}, 8500);
		}
	});

	/* Reload Table Date */
	if (tableReload == true) {
		SDNS_recordTable.fnReloadAjax();
	}

	/* Reload Page */
	if (pageReload == true) {
		setTimeout(function () {
			location.reload()
		}, 2000);
	}

	/* Reset Field Entries */
	if (fieldReset == true) {
		clearFields();
		resetDNSField();
	}

	/* Set Error Field */
	setErrorMark(errorFields);

}

function resetMessages() {

	/* Clear Message Box */
	$("#msgConsole").empty();

	/* Retrieve System Messages */
	getState();

	if ($("#sdns_zone").val().length > 0) {
		getZoneState();
	}

}

function getState() {

	var zone = $("#sdns_domain").val();

	var item = {
		action: 'systemState',
		zone: zone,
	};

	jsonString = JSON.stringify(item);

	sendData(jsonString);

}

function setErrorMark(fields) {

	/* Remove previous set errors */
	$(".col-md-1 div").removeClass("has-error");
	$(".col-md-2 div").removeClass("has-error");
	$(".col-md-3 div").removeClass("has-error");
	$(".col-md-9 div").removeClass("has-error");

	if (fields != null) {

		/* Add error to selected fields */
		var fields = fields.split(",");

		fields.forEach(function (field) {
			$("#" + field + "_field").addClass("has-error");
			;
		});

	}

}

function isDataTable(nTable) {
	return $.fn.DataTable.fnIsDataTable('#' + nTable);
}

function edit(id) {

	/* Reset previous selected field */
	resetDNSField();

	/* Enable current fields */
	$('#sdns_name_' + id).prop('disabled', false);
	$('#sdns_type_' + id).prop('disabled', false);
	$('#sdns_content_' + id).prop('disabled', false);
	$('#sdns_prio_' + id).prop('disabled', false);
	$('#sdns_ttl_' + id).prop('disabled', false);

	$('#sdns_edit_' + id).hide();
	$('#sdns_save_' + id).show();

	setRecord(id);

}

function resetDNSField() {

	var id = $("#sdns_record").val();

	if (id > 1) {
		/* Disable previous fields */
		$('#sdns_name_' + id).prop('disabled', true);
		$('#sdns_type_' + id).prop('disabled', true);
		$('#sdns_content_' + id).prop('disabled', true);
		$('#sdns_prio_' + id).prop('disabled', true);
		$('#sdns_ttl_' + id).prop('disabled', true);

		$('#sdns_save_' + id).hide();
		$('#sdns_edit_' + id).show();
	}
}

function deleteSelected() {

	var deleteArray = [];

	$("input:checkbox[name=sdns_select]:checked").each(function () {
		deleteArray.push($(this).val());
	});

	var zone = $("#sdns_zone").val();
	var records = deleteArray;

	var data = {
		action: 'deleteselectedrecords',
		zone: zone,
		records: records
	};

	jsonString = JSON.stringify(data);

	sendData(jsonString);

}

function setErrorField(field) {
	var record_id = $("#sdns_record").val();

	$("#sdns_z-" + field + "_" + record_id).addClass("has-error");
}

function clearFields() {
	$("#sdns_name_0").val("");
	$("#sdns_content_0").val("");
	$("#sdns_prio_0").val("");
}

function clearErrorField() {

	var record_id = $("#sdns_record").val();

	$("#sdns_z-name_" + record_id).removeClass("has-error");
	$("#sdns_z-type_" + record_id).removeClass("has-error");
	$("#sdns_z-content_" + record_id).removeClass("has-error");
	$("#sdns_z-prio_" + record_id).removeClass("has-error");
	$("#sdns_z-ttl_" + record_id).removeClass("has-error");

}

function record_add() {

	setRecord(0);
	clearErrorField()

	var zone = $("#sdns_zone").val();
	var var1 = $("#sdns_name_0").val();
	var var2 = $("#sdns_type_0").val();
	var var3 = $("#sdns_content_0").val();
	var var4 = $("#sdns_prio_0").val();
	var var5 = $("#sdns_ttl_0").val();

	var item = {
		action: 'addrecord',
		zone: zone,
		name: var1,
		type: var2,
		content: var3,
		prio: var4,
		ttl: var5
	};

	jsonString = JSON.stringify(item);

	sendData(jsonString);

}

function record_edit(record_id) {

	clearErrorField()

	var zone = $("#sdns_zone").val();

	var var1 = $("#sdns_name_" + record_id).val();
	var var2 = $("#sdns_type_" + record_id).val();
	var var3 = $("#sdns_content_" + record_id).val();
	var var4 = $("#sdns_prio_" + record_id).val();
	var var5 = $("#sdns_ttl_" + record_id).val();

	var item = {
		action: 'editrecord',
		zone: zone,
		record_id: record_id,
		name: var1,
		type: var2,
		content: var3,
		prio: var4,
		ttl: var5
	};

	jsonString = JSON.stringify(item);

	sendData(jsonString);

}

function record_delete() {

	var zone = $("#sdns_zone").val();
	var record_id = $("#sdns_record").val();

	var item = {
		action: 'deleterecord',
		zone: zone,
		record_id: record_id
	};

	jsonString = JSON.stringify(item);

	sendData(jsonString);

}

function setRecord(id) {
	$("#sdns_record").val(id);
}

function setDataURL() {

	var lastChar = location.pathname.substr(location.pathname.length - 1);

	if (lastChar.search(/^\s*\d+\s*$/) != -1) {

		var pathName = location.pathname.substr(0, location.pathname.lastIndexOf("\/"));
		pathName = pathName.substr(0, pathName.lastIndexOf("\/"));

	} else {
		var pathName = location.pathname.substr(0, location.pathname.lastIndexOf("\/"));

	}

	return location.protocol + '//' + location.host + pathName + '/';

}

$(document).ready(function () {

	/* Javascript to enable link to tab */
	var url = document.location.toString();
	if (url.match('#')) {
		$('.nav-tabs a[href="#' + url.split('#')[1] + '"]').tab('show');
		var atab = url.split('#')[1];
	}

	/* HTML5 Prevent scrolling! */
	$('.nav-tabs a').on('shown.bs.tab', function (e) {
		if (history.pushState) {
			history.pushState(null, null, e.target.hash);
		} else {
			window.location.hash = e.target.hash; //Polyfill for old browsers
		}
	})

	/* Activate tooltip */
	$(function () {
		$('[data-toggle="tooltip"]').tooltip({container: 'body', html: true,

			template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner large"></div></div>'

		})
	})

});