(function(angular){

    var module = angular.module('eventsPlanner', [
      'ionic',
      'ngCordova',
      'events.directives',
      'events.models',
      'events.controllers',
      'events.services',
      'ui.bootstrap.pagination',
      'template/pagination/pager.html',
      'template/pagination/pagination.html',
      'ui.bootstrap.collapse'
      ]);

    module.constant('CONSTANTS', {
      CLIENT_ID : '285780208615-tuarvu02t2ou4eonj0tel7905hch1st5.apps.googleusercontent.com',
      CLIENT_SECRET : '9pGiPun2lkNdbtL8Jp7opEqb',
      SCOPES: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.profile',
      API_KEY : 'AIzaSyDj-csmlxCNe9FcOzhJ_wsW-FziLd-cLhI',
      POST_TYPES : {
        location : 'location_category',
        vestimentation : 'vestimentation_category',
        decoration : 'decoration_category',
        entertainment : 'entertainment_category',
        beauty_salon : 'beauty_salon_category'
      }
    });

    module.run(function ($ionicPlatform, $rootScope, $ionicLoading, $ionicNavBarDelegate) {
      $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if(window.cordova && window.cordova.plugins.Keyboard) {
          cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if(window.StatusBar) {
          // org.apache.cordova.statusbar required
          StatusBar.styleDefault();
        }
      });

      $rootScope.$on('loader_show', function() {
          $ionicLoading.show();
      });

      $rootScope.$on('loader_hide', function() {
          $ionicLoading.hide();
      });

      $rootScope.goBack = function() {
        $ionicNavBarDelegate.back();
      };
    });

    module.service('authHttpResponseInterceptor',['$q', '$injector', function ($q, $injector){
        return {
            responseError: function(rejection) {
                if (rejection.status === 401 || rejection.status === 0) {
                    var authService = $injector.get('AuthenticationService');
                    authService.logout().then();
                }
                return $q.reject(rejection);
            }
        }
    }]);

    module.service('loadingInterceptor',['$rootScope', '$q', function ($rootScope, $q){
        var urls = ['https://accounts.google.com/o/oauth2/token',
                  'https://www.googleapis.com/oauth2/v1/userinfo',
                  'http://adclk.com/eventplanner/api/get_nonce',
                  'http://adclk.com/eventplanner/api/user/register'];
        return {
            request: function (config) {
                if (!_.contains(urls, config.url)) {
                    $rootScope.$broadcast('loader_show');
                }            
                return config || $q.when(config);
            },
            response: function (response) {
                $rootScope.$broadcast('loader_hide');
                return response || $q.when(response);
            },
            responseError: function (response) {
                $rootScope.$broadcast('loader_hide');
                return $q.reject(response);
            }
        };
    }]);

    module.config(['$httpProvider', '$stateProvider', '$urlRouterProvider', function ($httpProvider, $stateProvider, $urlRouterProvider) {
      $stateProvider
        .state('event', { url: "/events", templateUrl: "templates/events.html", controller: 'AppCtrl'})
        .state('menu', {
          url: "/menu",
          abstract: true,
          templateUrl: "templates/menu.html",
          controller: 'AppCtrl'
        })
        .state('menu.wedding', {
          url: "/wedding",
          views: {
            'menuContent' :{
              templateUrl: "templates/wedding.html",
              controller: 'AppCtrl'
            }
          }
        })
        .state('menu.invited', {
          url: "/invited",
          views: {
            'menuContent' :{
              templateUrl: "templates/invited.html",
              controller: 'InvitedCtrl'
            }
          }
        })
        .state('menu.locations', {
          url: "/locations/:type",
          views: {
            'menuContent' :{
              templateUrl: "templates/locations.html",
              controller: 'LocationsCtrl'
            }
          }
        })
        .state('menu.location', {
          url: "/locations/:type/:id",
          views: {
            'menuContent' :{
              templateUrl: "templates/location.html",
              controller: 'LocationCtrl'
            }
          }
        });

        $urlRouterProvider.otherwise('/events');
        $httpProvider.interceptors.push('authHttpResponseInterceptor');
        $httpProvider.interceptors.push('loadingInterceptor');

    }]);

}).call(this, this.angular);