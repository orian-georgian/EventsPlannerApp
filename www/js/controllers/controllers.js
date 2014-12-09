(function(angular){

    'use strict';

    angular.module('events.controllers', [])

    .controller('AppCtrl', function ($scope, $ionicModal, $ionicPopup, $timeout, $localStorage, AuthenticationService, AuthenticationModel, WeddingService, CONSTANTS) {

      var authModel = $localStorage.Get('token');
      $scope.weddingPlan = {
        budget: 40000
      };
      $scope.postType = CONSTANTS.POST_TYPES;

      $scope.datesAreEqual = function() {
          return $scope.minDate > $scope.weddingPlan.date;
      };

      if (authModel) {
        AuthenticationModel = authModel;
        $scope.authenticationModel = authModel;
      } else {
        $scope.authenticationModel = AuthenticationModel;
      }
      
     
      $ionicModal.fromTemplateUrl('templates/weddingPlan.html', {
        scope: $scope
      }).then(function(modal) {
        $scope.weddingPlanModal = modal;
      });

      $scope.logout = function() {
        var confirmPopup = $ionicPopup.confirm({
          title: 'Logout',
          template: 'Are you sure you want to logoff?'
        });
        confirmPopup.then(function(res) {
          if(res) {
            AuthenticationService.logout().then();
          } else {
            return;
          }
        });
      };

      $scope.closeWeddingPlan = function() {
        $scope.weddingPlanModal.hide();
      };

      $scope.login = function() {
          AuthenticationService.login().then(function(authenticationModel){
            $scope.authenticationModel = authenticationModel;
          });
      };

      $scope.weddingPlanBox = function() {
        $scope.weddingPlanModal.show();
      };

      $scope.planYourWedding = function() {
          WeddingService.makeAWish($scope.weddingPlan).then(function(){
            $scope.closeWeddingPlan();
          });
      };


    })

    .controller('InvitedCtrl', function($scope, $cordovaContacts, $ionicModal, $ionicPopup, InvitedService) {

      $scope.invitedContacts = [];
      $scope.isHidden = true;

      function isEmpty(data) {
        return _.isEmpty(data) || _.isNull(data) || _.isUndefined(data);
      }

      $ionicModal.fromTemplateUrl('templates/phoneContacts.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.contactsModal = modal;
        });

      $scope.importPhoneContacts = function() {
        InvitedService.getPhoneContacts().then(function(result){
          $scope.phoneContacts = result;
          $scope.contactsModal.show();
        });
        
      };

      $scope.closePhoneContacts = function() {
        $scope.contactsModal.hide();
      };

      $scope.saveContacts = function() {
        var selectedContacts = _.where($scope.phoneContacts, {toSave:true});
        if (isEmpty(selectedContacts)) {
          $ionicPopup.alert({
           title: 'Attention!',
           template: 'Please select some contacts to add!'
         });
        } else {
          _.each(selectedContacts, function(contact) {
            if (!_.find($scope.invitedContacts, { contactId : contact.contactId })) {
              $scope.invitedContacts.push(contact);
            }
          });
          $scope.closePhoneContacts();
          /*InvitedService.sendSelectedContacts(selectedContacts).then();*/
        }
      };

        $ionicModal.fromTemplateUrl('templates/newInvited.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.invitedModal = modal;
        });

        function emptyInputs() {
          $scope.invitedPerson = {
            fullName : null,
            phoneNumber : null,
            mailAddress : null,
            homeAddress : null
          };
          $scope.isHidden = true;
        }


        $scope.showInvited = function() {
          $scope.invitedModal.show();
        };

        $scope.closeInvited = function() {
          $scope.invitedModal.hide();
          emptyInputs();
        };

        $scope.addNewInvited = function(invitedPerson) {
            var contact = {
                contactId : invitedPerson.fullName + invitedPerson.phoneNumber,
                fullName : invitedPerson.fullName,
                phoneNumber : invitedPerson.phoneNumber,
                mailAddress : invitedPerson.mailAddress,
                homeAddress : invitedPerson.homeAddress,
                hasConfirmed : false,
                tableNumber : null,
                wasInvited : false
            };
            /*InvitedService.addNewContact(contact).then(function(){
              $scope.closeInvited();
              emptyInputs();
            });*/
            $scope.invitedContacts.push(contact);
            $scope.closeInvited();
        };

        $scope.editContact = function(currentContact) {

            $scope.showInvited();
            $scope.isHidden = false;
            $scope.invitedPerson = {
                contactId : currentContact.contactId,
                fullName : currentContact.fullName,
                phoneNumber : currentContact.phoneNumber,
                mailAddress : currentContact.mailAddress,
                homeAddress : currentContact.homeAddress,
                hasConfirmed : currentContact.hasConfirmed,
                tableNumber : currentContact.tableNumber,
                wasInvited : currentContact.wasInvited
            };
        };

        $scope.saveContact = function(currentContact) {
          var wantedInvited = _.find($scope.invitedContacts, { contactId : currentContact.contactId} ); 
          _.merge(wantedInvited, currentContact);
          $scope.closeInvited();
        };

        $scope.removeContact = function(currentContact) {
          var confirmPopup = $ionicPopup.confirm({
            title: 'Remove contact',
            template: 'Are you sure you want to remove <strong>' + currentContact.fullName + '</strong>?'
          });
          confirmPopup.then(function(res) {
            if(res) {
              var index = $scope.invitedContacts.indexOf(currentContact);
              $scope.invitedContacts.splice(index, 1);
              /*InvitedService.removeContact(currentContact.contactId).then(initialize);*/
            } else {
              return;
            }
          });
        };

        $scope.confirmInvitation = function(contact) {
          contact.wasInvited = true;
        };

        $scope.confirmConfirmation = function(contact) {
          contact.hasConfirmed = true;
        };

        $scope.denyInvitation = function(contact) {
          contact.wasInvited = false;
        };

        $scope.denyConfirmation = function(contact) {
          contact.hasConfirmed = false;
        };

        $scope.isEmpty = isEmpty;

    })

    .controller('LocationsCtrl', function ($scope, $stateParams, $ionicScrollDelegate, LocationsService) {

        var post_type = $stateParams.type;
        $scope.page = { currentPage : 1 };
        $scope.numPerPage = 10;

        function getLocationCategories() {
          switch (post_type) {
            case 'location_category':
              $scope.locationCategories = [
                  { label : 'Churches', post_type : 'churches'},
                  { label : 'Restaurants', post_type : 'restaurants'},
                  { label : 'Tents', post_type : 'tents'}
              ];
              break;

            case 'entertainment_category':
              $scope.locationCategories = [
                  { label : 'Governor', post_type : 'governor'},
                  { label : 'Music', post_type : 'music'},
                  { label : 'Photo', post_type : 'photo'},
                  { label : 'Video', post_type : 'video'}
              ];
              break;

            case 'vestimentation_category':
              $scope.locationCategories = [
                  { label : 'Accessories', post_type : 'accessories'},
                  { label : 'Costumes', post_type : 'costume'},
                  { label : 'Dresses', post_type : 'dress'},
                  { label : 'Jewellery', post_type : 'jewellery'},
                  { label : 'Shoes', post_type : 'shoes'}
              ];
              break;

            case 'decoration_category':
              $scope.locationCategories = [
                  { label : 'Art decorations', post_type : 'art_deco'},
                  { label : 'Flowershop', post_type : 'flowershop'},
                  { label : 'Invitations', post_type : 'invitations'},
                  { label : 'Others', post_type : 'others'}
              ];
              break;
            case 'beauty_salon_category':
              $scope.locationCategories = null;
              break;
          }
        }


        function initialize(currentPage) {
            LocationsService.getLocationByCategory(post_type, null, $scope.page.currentPage).then(function(data){
              $scope.locations = data.locations;
              $scope.totalItems = data.count;
              $scope.nrOfPages = data.pages;
              $ionicScrollDelegate.scrollTop(true);
            });
        };


        $scope.getLocationsByCategory = function(category) {

          $scope.page = { currentPage : 1 };
          if (category !== null) {
            LocationsService.getLocationByCategory(post_type, category.post_type, $scope.page.currentPage).then(function(data){
              $scope.locations = data.locations;
              $scope.totalItems = data.count;
              $scope.nrOfPages = data.pages;
              $ionicScrollDelegate.scrollTop(true);
            });
          } else {
              initialize($scope.page.currentPage);
          }
        };

        $scope.$watch('page.currentPage', function(){
            initialize($scope.page.currentPage);
        });

        getLocationCategories();

    })

    .controller('LocationCtrl', function ($scope, $stateParams, LocationsService) {
        var type = $stateParams.type,
            id = $stateParams.id;

        function initialize() {
            LocationsService.getCurrentLocation(type, id).then(function(location){
                $scope.locationItem = location;
            });
        }
        initialize();
    });

}).call(this, this.angular);