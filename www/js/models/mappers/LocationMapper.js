(function(){

	'use strict';

	var EventLocation = this.EventLocation,
		LocationObject = this.LocationObject;

	function LocationMapper(){

		function mapLocations(dto) {

			var locationsArray = [],
				locationObject = new LocationObject();

			locationObject.count = dto.count;
			locationObject.total_count = dto.count_total;
			locationObject.pages = dto.pages;

			_.each(dto.posts, function(data){
				var location = new EventLocation();
				location.id = data.id;
				location.type = data.type;
				location.content = data.content;
				location.name = data.custom_fields.name;
				location.address = data.custom_fields.address;
				location.city = data.custom_fields.city;
				location.category = data.custom_fields.category;
				location.capacity = data.custom_fields.capacity;
				location.link = data.custom_fields.link;
				location.phone = data.custom_fields.phone;
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