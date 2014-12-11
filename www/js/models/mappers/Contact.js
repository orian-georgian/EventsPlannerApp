(function(){

	'use strict';

	function Contact() {

		this.contactId = null;
		this.fullName = null;
		this.phoneNumber = null;
		this.mailAddress = null;
		this.homeAddress = null;
		this.hasConfirmed = 0;
		this.wasInvited = 0;
		this.tableNumber = 0;

		this.parseToBoolean = function (string) {
			return string === "0" ? false : true;
		};

		this.parseToInt = function (string) {
			return parseInt(string, 10);
		};

	}

	this.Contact = Contact;

}).call(this);