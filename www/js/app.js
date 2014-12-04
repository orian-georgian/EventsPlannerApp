(function(angular){

    var module = angular.module('eventsPlanner', ['ionic', 'ngCordova', 'events.models', 'events.controllers', 'events.services'])

    module.constant('CONSTANTS', {
      CLIENT_ID : '285780208615-tuarvu02t2ou4eonj0tel7905hch1st5.apps.googleusercontent.com',
      CLIENT_SECRET : '9pGiPun2lkNdbtL8Jp7opEqb',
      API_KEY : 'AIzaSyDj-csmlxCNe9FcOzhJ_wsW-FziLd-cLhI'
    });

    module.run(function($ionicPlatform) {
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
    });

    module.service('authHttpResponseInterceptor',['$q', '$injector', function ($q, $injector){
        return {
            responseError: function(rejection) {
                if (rejection.status === 401 || rejection.status === 0) {
                    var authService = $injector.get('AuthenticationService');
                    /*authService.logout().then();*/
                }
                return $q.reject(rejection);
            }
        }
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
              controller: 'EventsCtrl'
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
        });
        $urlRouterProvider.otherwise('/events');
        $httpProvider.interceptors.push('authHttpResponseInterceptor');
    }]);

}).call(this, this.angular);