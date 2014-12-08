(function(){

	'use strict';

	var EventLocation = this.EventLocation,
		LocationObject = this.LocationObject;

	function LocationMapper(){

		function mapLocations(dto) {

			var locationsArray = [],
				locationObject = new LocationObject();

			locationObject.count = dto.count;
			locationObject.count_total = dto.count_total;
			locationObject.pages = dto.pages;

			_.each(dto.posts, function(data){
				var location = new EventLocation();
				location.id = _.isUndefined(data.id) ? null : data.id;
				location.type = _.isUndefined(data.type) ? null : data.type;
				location.content = _.isUndefined(data.content) ? null : data.content;
				location.name = _.isUndefined(data.custom_fields.name) ? null : data.custom_fields.name;
				location.address = _.isUndefined(data.custom_fields.address) ? null : data.custom_fields.address;
				location.city = _.isUndefined(data.custom_fields.city) ? null : data.custom_fields.city;
				location.category = _.isUndefined(data.custom_fields.category) ? null : data.custom_fields.category;
				location.capacity = _.isUndefined(data.custom_fields.capacity) ? null : data.custom_fields.capacity;
				location.link = _.isUndefined(data.custom_fields.link) ? null : data.custom_fields.link;
				location.phone = _.isUndefined(data.custom_fields.phone) ? null : data.custom_fields.phone;
				location.picture = _.isUndefined(data.custom_fields.picture) ? null : data.custom_fields.picture;
				location.dates = _.isUndefined(data.custom_fields.dates) ? null : data.custom_fields.dates;

				locationsArray.push(location);
			});

			locationObject.locations = locationsArray;

			return locationObject;
		}

		this.mapLocations = mapLocations;

	}

	this.LocationMapper = LocationMapper;

}).call(this);