(function(){

	'use strict';

	function DataModel() {

		function Invited() {
			this.id = null;
			this.firstName =  null;
			this.lastName =  null;
			this.phoneNumber =  null;
			this.confirmationDate =  null;
			this.mailAddress = null;
			this.man = true;
			this.wasInvited = false;
		}

		this.Invited = Invited;
	}

	this.DataModel = new DataModel();	

}).call(this);