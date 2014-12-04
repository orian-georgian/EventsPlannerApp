(function(_){

	'use strict';

	function DataAdapter() {

		function getInvited() {
			var invitedList = [];

			_.each(DataSource, function(data){
				var invited = new DataModel.Invited();
				invited.id = data.id;
				invited.firstName = data.firstName;
				invited.lastName = data.lastName;
				invited.phoneNumber = data.phoneNumber;
				invited.confirmationDate = data.confirmationDate;
				invited.mailAddress = data.mailAddress;
				invited.man = data.man;
				invited.wasInvited = data.wasInvited;
				invitedList.push(invited);
			});

			return invitedList;
		};

		this.GetInvited = getInvited;

	}

	this.DataAdapter = DataAdapter;

}).call(this, this._);