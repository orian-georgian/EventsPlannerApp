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
            $window.localStorage.removeItem(key);
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
			}).error(function(error){
				deff.reject(error);
				this.disconnect().then();
			});
			return deff.promise;
		};

		this.disconnect = function(){
			deff = $q.defer();
			$state.go('event');
			AuthenticationModel.isLoggedIn = false;
			$localStorage.Zap('token');
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
    				userName : data.name,
    				picture : data.picture
    			}
    			registerUser(user);
    		})
    		.error(function(error){

    		});
		}

		function registerUser(user) {
			$http({
				method : 'POST',
				url : '',
				params : user
			})
    		.success(function(data){
    			
    		})
    		.error(function(error){

    		});
		}

		$http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

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