(function(angular, $){	

	var module = angular.module('events.services', []),
		mapper = this.ContactsMapper,
		locationMapper = this.LocationMapper;

	module.factory('$localStorage', ['$window', function ($window) {

        function storeData(key, value) {
            $window.localStorage.setItem(key ,angular.toJson(value));
        }

        function readData(key) {
            return angular.fromJson($window.localStorage.getItem(key));
        }

        function removeData(key) {
            $window.localStorage.removeItem(key);
        }

		return {
			Set : storeData,
        	Get : readData,
        	Zap : removeData
		};
	}]);

	module.factory('$messageBox',['$ionicPopup', '$timeout', function ($ionicPopup, $timeout){
		return {
			showMessage : function(message){
				var messageBox = $ionicPopup.show({
					template: message
				});
				$timeout(function(){
					messageBox.close();
				}, 3000);
			}
		}
	}]);

	module.service('AuthenticationService', function ($http, $q, $state, $rootScope, $timeout, $localStorage, AuthenticationModel, CONSTANTS){

		var deff = {},
			requestToken = '',
			accessToken = '';

		this.login = function() {
			deff = $q.defer();
			var ref = window.open('https://accounts.google.com/o/oauth2/auth?client_id=' + CONSTANTS.CLIENT_ID + '&redirect_uri=http://localhost/callback&scope=' + CONSTANTS.SCOPES +'&approval_prompt=force&response_type=code&access_type=offline', '_blank', 'location=no');
	        ref.addEventListener('loadstart', function(event) { 
	            if((event.url).startsWith("http://localhost/callback")) {
	                requestToken = (event.url).split("code=")[1];
	                getToken(requestToken);
	                ref.close();
	            }
	        });
	        return deff.promise;
		};

		if (typeof String.prototype.startsWith != 'function') {
			String.prototype.startsWith = function (str){
				return this.indexOf(str) == 0;
			};
		}

		this.logout = function(){
			deff = $q.defer();
			$state.go('event', {}, {reload: true});
			AuthenticationModel.isLoggedIn = false;
			$localStorage.Zap('token');
			$localStorage.Zap('userId');
			return deff.promise;
		};

		/*this.checkTokenValidation = function() {
			var model = _.isUndefined($localStorage.Get('token')) ? null : $localStorage.Get('token');
			deff = $q.defer();
			$http({
				method : 'POST',
				url : 'https://www.googleapis.com/oauth2/v1/tokeninfo',
				params : {
					access_token : model.token
				}
			})
    		.success(function(data){
    			defer.resolve(data);
    		})
    		.error(function(error){
    			defer.reject(error);
    		});

    		return defer.promise;
		}*/

		function getToken(requestToken){

			$http({
				method: "post",
				url: "https://accounts.google.com/o/oauth2/token",
				data: "client_id=" + CONSTANTS.CLIENT_ID + "&client_secret=" + CONSTANTS.CLIENT_SECRET + "&redirect_uri=http://localhost/callback" + "&grant_type=authorization_code" + "&code=" + requestToken
			})
            .success(function(data) {
            	accessToken = data.access_token;
            	getUserInfo(accessToken);
                AuthenticationModel.isLoggedIn = true;
				AuthenticationModel.token = data.access_token;
				$localStorage.Set('token', AuthenticationModel);
		        deff.resolve(AuthenticationModel);
            })
            .error(function(data, status) {
                alert("ERROR: " + data);
            });
		}

		function getUserInfo(accessToken) {
			$http({
				method : 'GET',
				url : 'https://www.googleapis.com/oauth2/v1/userinfo',
				params : {
					alt : 'json',
					access_token : accessToken
				}
			})
    		.success(function(data){
    			var user = {
    				userId : data.id,
    				userName : data.name
    			}
    			$localStorage.Set('userId', data.id);
    			getRegisterNonce().then(function(nonce){
    				registerUser(user, nonce).then();
    			});
    		})
    		.error(function(error){

    		});
		}

		function getRegisterNonce() {
			deff = $q.defer();
			$http({
				method : 'GET',
				url : 'http://adclk.com/eventplanner/api/get_nonce/',
				params : {
					controller : 'user',
					method : 'register'
				}
			})
    		.success(function(data){
    			deff.resolve(data.nonce);
    		})
    		.error(function(error){
    			deff.reject(error);
    		});
    		return deff.promise;
		}

		function registerUser(user, nonce) {
			deff = $q.defer();
			$http({
				method : 'POST',
				url : 'http://adclk.com/eventplanner/api/user/register/',
				params : {
					userName : user.userName,
					userId : user.userId,
					nonce : nonce
				}
			})
    		.success(function(data){
    			deff.resolve(data);
    		})
    		.error(function(error){
    			deff.reject(error);
    		});

    		return deff.promise;
		}

		$http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

	});

	module.service('InvitedService', function ($http, $q, $cordovaContacts, AuthenticationModel) {

		var contactsMapper = new mapper();

		this.getPhoneContacts = function() {
			var result = $q.defer();

			$cordovaContacts.find({filter: '', multiple: false}).then(function(data) {
           		result.resolve(contactsMapper.mapContacts(data));
	        }, function(error) {
	        	result.reject(error);
	        });

			return result.promise;
		};

		this.getAllContacts = function(userId, pageNumber) {
			var result = $q.defer();
			$http({
				url : 'http://adclk.com/eventplanner/api/get_author_posts/',
				method : 'GET',
				params : {
					slug : userId,
					post_type : 'contact',
					page : pageNumber
				}
			}).success(function(data){
				result.resolve({mapped : contactsMapper.mapServerContacts(data), unmapped: data.posts});
			}).error(function(error){
				result.reject(error);
			});
			return result.promise;
		};

		this.sendSelectedContacts = function(contacts, userId) {
			var data = {
					userId : userId,
					contacts : contactsMapper.unmapContacts(contacts)
				};
			var result = $q.defer();
			
			$http({
				withCredentials: false,
				url : 'http://adclk.com/eventplanner/api/posts/create_contacts/',
				method : 'POST',
				data : JSON.stringify(data),
				headers: {'Content-Type': 'application/x-www-form-urlencoded'}
			}).success(function(data){
				result.resolve(data);
			}).error(function(error){
				result.reject(error);
			});
			return result.promise;
		};

		this.saveContactChanges = function(userId, contactId, contacts) {
			var data = {
				userId : userId,
				contactId : contactId,
				contacts : contactsMapper.unmapContacts(contacts)
			};
			var result = $q.defer();
			$http({
				withCredentials: false,
				url : 'http://adclk.com/eventplanner/api/posts/update_contact',
				method : 'POST',
				data : JSON.stringify(data),
				headers: {'Content-Type': 'application/x-www-form-urlencoded'}
			}).success(function(data){
				result.resolve(data);
			}).error(function(error){
				result.reject(error);
			});
			return result.promise;
		};

		this.removeContact = function(userId, contactId) {
			var data = {
				userId : userId,
				contactId : contactId
			};
			var result = $q.defer();
			$http({
				url : 'http://adclk.com/eventplanner/api/posts/delete_contact',
				method : 'POST',
				data : JSON.stringify(data),
				headers: {'Content-Type': 'application/x-www-form-urlencoded'}
			}).success(function(data){
				result.resolve(data);
			}).error(function(error){
				result.reject(error);
			});
			return result.promise;
		};

	});


	module.service('LocationsService', function ($http, $q) {

		var lmapper = new locationMapper();

		this.getLocationByCategory = function(locationCategory, category, pageNumber) {
			var deferred = $q.defer();

			$http({
				url : 'http://adclk.com/eventplanner/api/taxonomy/get_taxonomy_posts/',
				method : 'GET',
				headers: {
					'Content-type': 'application/jsonp'
				},
				params : {
					taxonomy : locationCategory,
					slug : category,
					page : pageNumber
				}
			})
			.success(function(data){
				deferred.resolve(lmapper.mapLocations(data));
			}).error(function(error){
				deferred.reject(error);
			});

			return deferred.promise;
		};

		this.getCurrentLocation = function(type, id) {
			var deferred = $q.defer();

			$http({
				url : 'http://adclk.com/eventplanner/api/post/',
				method : 'GET',
				headers: {
					'Content-type': 'application/jsonp'
				},
				params : {
					json : 'get_post',
					id : id,
					post_type : type
				}
			})
			.success(function(data){
				deferred.resolve(lmapper.mapCurrentLocation(data.post));
			}).error(function(error){
				deferred.reject(error);
			});

			return deferred.promise;
		};

		this.getSimilarLocation = function(type, id) {
			var deferred = $q.defer();

			$http({
				url : 'http://adclk.com/eventplanner/api/post/',
				method : 'GET',
				headers: {
					'Content-type': 'application/jsonp'
				},
				params : {
					json : 'get_similar_post',
					id : id,
					post_type : type
				}
			})
			.success(function(data){
				deferred.resolve(lmapper.mapCurrentLocation(data.post));
			}).error(function(error){
				deferred.reject(error);
			});

			return deferred.promise;
		};

		this.checkAddressValidity = function(address) {
			var deferred = $q.defer();

			$http({
				url : 'http://maps.googleapis.com/maps/api/geocode/json',
				method : 'GET',
				headers: {
					'Content-type': 'application/jsonp'
				},
				params : {
					address : address,
					sensor : false
				}
			})
			.success(function(data){
				deferred.resolve(data);
			}).error(function(error){
				deferred.reject(error);
			});

			return deferred.promise;
		};

		this.suggestLocation = function(weddingPlan) {
			var deferred = $q.defer();

			$http({
				url : 'http://adclk.com/eventplanner/api/suggest_locations/',
				method : 'GET',
				headers: {
					'Content-type': 'application/jsonp'
				},
				params : {
					date : weddingPlan.date,
					location : weddingPlan.place,
					capacity : weddingPlan.invited
				}
			})
			.success(function(data){
				deferred.resolve(lmapper.mapLocations(data));
			}).error(function(error){
				deferred.reject(error);
			});

			return deferred.promise;
		};

		this.getWeddingDate = function(userId) {
			var deferred = $q.defer();

			$http({
				url : 'http://adclk.com/eventplanner/api/user/get_user_meta/',
				method : 'GET',
				headers: {
					'Content-type': 'application/jsonp'
				},
				params : {
					userId : userId
				}
			})
			.success(function(data){
				deferred.resolve(data);
			}).error(function(error){
				deferred.reject(error);
			});

			return deferred.promise;
		};

		this.addWeddingDate = function(userId, weddingDate) {
			var deferred = $q.defer();

			$http({
				url : 'http://adclk.com/eventplanner/api/user/add_user_meta/',
				method : 'GET',
				headers: {
					'Content-type': 'application/jsonp'
				},
				params : {
					userId : userId,
					meta_key : 'date',
					meta_value : weddingDate
				}
			})
			.success(function(data){
				deferred.resolve(data);
			}).error(function(error){
				deferred.reject(error);
			});

			return deferred.promise;
		};

	});

}).call(this, this.angular, this.jQuery);