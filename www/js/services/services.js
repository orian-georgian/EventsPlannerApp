(function(angular){	

	var module = angular.module('events.services', []),
		mapper = this.ContactsMapper;

	module.factory('$localStorage', ['$window', function ($window) {

        function storeData(key, value) {
            $window.localStorage.setItem(key ,angular.toJson(value));
        }

        function readData(key) {
            return angular.fromJson($window.localStorage.getItem(key));
        }

        function removeData(key) {
            if (angular.isFunction($window.localStorage.removeItem)) {
                $window.localStorage.removeItem(key);
                return;
            }
            delete $window.localStorage[key];
        }

		return {
			Set : storeData,
        	Get : readData,
        	Zap : removeData
		};
	}]);

	module.service('AuthenticationService', function ($http, $q, $state, $rootScope, $timeout, $localStorage, AuthenticationModel, WeddingService, CONSTANTS){

		var deff = {},
			requestToken = '',
			accessToken = '';

		$http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

		this.login = function() {
			deff = $q.defer();
			var ref = window.open('https://accounts.google.com/o/oauth2/auth?client_id=' + CONSTANTS.CLIENT_ID + '&redirect_uri=http://localhost/callback&scope=https://www.googleapis.com/auth/urlshortener&approval_prompt=force&response_type=code&access_type=offline', '_blank', 'location=no');
	        ref.addEventListener('loadstart', function(event) { 
	            if((event.url).startsWith("http://localhost/callback")) {
	                requestToken = (event.url).split("code=")[1];
	                $http({method: "post", url: "https://accounts.google.com/o/oauth2/token", data: "client_id=" + CONSTANTS.CLIENT_ID + "&client_secret=" + CONSTANTS.CLIENT_SECRET + "&redirect_uri=http://localhost/callback" + "&grant_type=authorization_code" + "&code=" + requestToken })
	                    .success(function(data) {
	                        accessToken = data.access_token;
	                        $state.go('menu.wedding');
	                        AuthenticationModel.isLoggedIn = true;
							AuthenticationModel.token = data.access_token;
							$localStorage.Set('token', AuthenticationModel);
							$rootScope.$apply(function() {
					          	deff.resolve(AuthenticationModel);
					        });
	                    })
	                    .error(function(data, status) {
	                        alert("ERROR: " + data);
	                    });
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
			var authModel = $localStorage.Get('token');
			deff = $q.defer();
			$http({
				url : 'https://accounts.google.com/o/oauth2/revoke',
				method : 'GET',
				params : {
					token : authModel.token
				}
			}).success(function(data){
				deff.resolve(data);
				$state.go('event');
				AuthenticationModel.isLoggedIn = false;
				$localStorage.Zap('token');
			}).error(function(){
				deff.reject(data);
			});
			return deff.promise;
		};

	});

	module.service('WeddingService', function ($http, $q) {

		this.makeAWish = function(weddingPlan) {
			var result = $q.defer();

			$http({
				url : '',
				method: 'POST',
				data : weddingPlan
			})
			.success(function(data){
				result.resolve(data);
			})
			.error(function(error){
				result.reject(error);
			});

			return result.promise;
		};

		this.sendAuthUserInfo = function(userData) {
			var result = $q.defer();

			$http({
				url : '',
				method: 'POST',
				data : userData
			})
			.success(function(data){
				result.resolve(data);
			})
			.error(function(error){
				result.reject(error);
			});

			return result.promise;
		};

	});

	module.service('InvitedService', function ($http, $q, $cordovaContacts, AuthenticationModel) {

		var contactsMapper = new mapper();

		this.getPhoneContacts = function() {
			var result = $q.defer();

			$cordovaContacts.find({filter: ''}).then(function(data) {
           		result.resolve(contactsMapper.mapContacts(data));
	        }, function(error) {
	        	result.reject(error);
	        });

			return result.promise;
		};

		this.sendSelectedContacts = function(contacts) {
			var result = $q.defer();
			$http({
				url : '',
				method : 'POST',
				data : contactsMapper.unmapContacts(contacts)
			}).success(function(data){
				result.resolve(data);
			}).error(function(error){
				result.reject(error);
			});
			return result.promise;
		};

	});

}).call(this, this.angular);