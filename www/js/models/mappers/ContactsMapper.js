(function(){

	'use strict';

	var Contact =  this.Contact;

	function ContactsMapper() {

		function mapContacts(dto) {
			var contactsList = [];
			_.each(dto, function(d) {
				var contact = new Contact();
				contact.fullName = d.displayName;
				contact.phoneNumber = d.phoneNumbers ? d.phoneNumbers[0].value : null;
				contact.mailAddress = d.emails ? d.emails[0].value : null;
				contact.contactId = contact.fullName + contact.phoneNumber;
				contact.hasConfirmed = false;
				contact.homeAddress = d.addresses ? d.addresses[0].value : null;
				contact.wasInvited = false;
				contact.tableNumber = null;
				contactsList.push(contact);
			});
			return contactsList;
		}

		function unmapContacts(contacts) {
			var contactsToSend = [], data = {};
			_.each(contacts, function(c) {
				data = {
					fullName : c.fullName,
					phoneNumber : c.phoneNumber,
					mailAddress : c.mailAddress,
					contactId : c.contactId,
					hasConfirmed : c.hasConfirmed,
					wasInvited : c.wasInvited,
					homeAddress : c.homeAddress,
					tableNumber : c.tableNumber
				};
				contactsToSend.push(data);
			});
			return contactsToSend;
		}

		this.mapContacts = mapContacts;
		this.unmapContacts = unmapContacts;

	}

	this.ContactsMapper = ContactsMapper;

}).call(this);