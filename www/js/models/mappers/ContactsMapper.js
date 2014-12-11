(function(){

	'use strict';

	var Contact =  this.Contact,
		ContactObject = this.ContactObject;

	function ContactsMapper() {

		function mapContacts(dto) {
			var contactsList = [];
			_.each(dto, function(d) {
				var contact = new Contact();
				contact.fullName = d.displayName;
				contact.phoneNumber = d.phoneNumbers ? d.phoneNumbers[0].value : null;
				contact.mailAddress = d.emails ? d.emails[0].value : null;
				contact.contactId = contact.fullName + contact.phoneNumber;
				contact.hasConfirmed = '0';
				contact.homeAddress = d.addresses ? d.addresses[0].value : null;
				contact.wasInvited = '0';
				contact.tableNumber = '0';
				contactsList.push(contact);
			});
			return contactsList;
		}

		function mapServerContacts(dto) {
			var contactsArray = [],
				contactObject = new ContactObject();

			contactObject.pages = dto.pages;
			contactObject.count = dto.count;
			contactObject.count_total = dto.count_total;

			_.each(dto.posts, function(post){
				var contact = new Contact();
				contact.fullName = post.custom_fields.fullname[0];
				contact.phoneNumber = post.custom_fields.phonenumber[0];
				contact.mailAddress = post.custom_fields.mailaddress[0];
				contact.contactId = post.custom_fields.id[0];
				contact.hasConfirmed = contact.parseToBoolean(post.custom_fields.hasconfirmed[0]);
				contact.homeAddress = _.isUndefined(post.custom_fields.homeaddress) ? null : post.custom_fields.homeaddress[0];
				contact.wasInvited = contact.parseToBoolean(post.custom_fields.wasinvited[0]);
				contact.tableNumber = contact.parseToInt(post.custom_fields.tablenumber[0]);
				contactsArray.push(contact);
			});

			contactObject.contacts = contactsArray;

			return contactObject;
		}

		function unmapContactsList(contacts) {
			var array = [];
			_.each(contacts, function(post){
				var contact = new Contact();
				contact.fullName = post.custom_fields.fullname[0];
				contact.phoneNumber = post.custom_fields.phonenumber[0];
				contact.mailAddress = post.custom_fields.mailaddress[0];
				contact.contactId = post.custom_fields.id[0];
				contact.hasConfirmed = contact.parseBoolToString(post.custom_fields.hasconfirmed[0]);
				contact.homeAddress = _.isUndefined(post.custom_fields.homeaddress) ? null : post.custom_fields.homeaddress[0];
				contact.wasInvited = contact.parseBoolToString(post.custom_fields.wasinvited[0]);
				contact.tableNumber = contact.parseIntToString(post.custom_fields.tablenumber[0]);
				array.push(contact);
			});
			return array;
		}

		function unmapContacts(contacts) {

			var contactsToSend = [],
				data = {},
				ctc = new Contact();
			contacts = _.isUndefined(contacts[0].attachments) ? contacts : unmapContactsList(contacts);
			_.each(contacts, function(c) {
				data = {
					fullName : c.fullName,
					phoneNumber : c.phoneNumber,
					mailAddress : c.mailAddress,
					contactId : c.contactId,
					hasConfirmed : ctc.parseBoolToString(c.hasConfirmed),
					wasInvited : ctc.parseBoolToString(c.wasInvited),
					homeAddress : c.homeAddress,
					tableNumber : ctc.parseIntToString(c.tableNumber)
				};
				contactsToSend.push(data);
			});
			return contactsToSend;
		}

		this.mapContacts = mapContacts;
		this.unmapContacts = unmapContacts;
		this.mapServerContacts = mapServerContacts;

	}

	this.ContactsMapper = ContactsMapper;

}).call(this);