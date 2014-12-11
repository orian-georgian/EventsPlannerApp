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
      
     
     $ionicModal.fromTemplateUrl('templates/locationSuggest.html', function($ionicModal) {
        $scope.weddingPlanModal = $ionicModal;
    }, {
        // Use our scope for the scope of the modal to keep it simple
        scope: $scope,
        // The animation we want to use for the modal entrance
        animation: 'slide-in-up'
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

    .controller('InvitedCtrl', function($scope, $localStorage, $cordovaContacts, $ionicModal, $ionicPopup, $ionicScrollDelegate, InvitedService) {

      $scope.page = { currentPage : 1 };
      $scope.isHidden = true;
      var originalContacts = null,
          userId = $localStorage.Get('userId');

      function getContacts() {
        InvitedService.getAllContacts(userId, $scope.page.currentPage).then(function(data){
          $scope.invitedContacts = data.mapped.contacts;
          $scope.totalItems = data.count_total;
          $scope.nrOfPages = data.pages;
          $ionicScrollDelegate.scrollTop(true);
          originalContacts = data.unmapped;
        });
      }

      function isEmpty(data) {
        return _.isEmpty(data) || _.isNull(data) || _.isUndefined(data);
      }

      function parseBoolToString(bool) {
        return bool === false ? '0' : '1'; 
      }

      function parseIntToString(number) {
        return number.toString();
      }

      function getOriginalCurrentContact(currentContact) {
        var originalContact = _.find(originalContacts, function(contact){
            return contact.custom_fields.id[0] === currentContact.contactId;
          });
        return originalContact;
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
          if (_.intersection($scope.phoneContacts, selectedContacts)) {
              $ionicPopup.alert({
               title: 'Attention!',
               template: 'Some contacts was already added!'
             });
          } else {
              InvitedService.sendSelectedContacts(selectedContacts, userId).then();
              $scope.closePhoneContacts();
          }          
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
            homeAddress : null,
            wasInvited : false,
            hasConfirmed : false,
            tableNumber : 0,
            contactId : null
          };
          $scope.isHidden = true;
        }


        $scope.showInvited = function() {
          $scope.invitedModal.show();
        };

        $scope.closeInvited = function() {
          emptyInputs();
          $scope.invitedModal.hide();      
        };

        $scope.addNewInvited = function(invitedPerson) {
            var contactsList = [],
            contact = {
                contactId : invitedPerson.fullName + invitedPerson.phoneNumber,
                fullName : invitedPerson.fullName,
                phoneNumber : invitedPerson.phoneNumber,
                mailAddress : invitedPerson.mailAddress,
                homeAddress : isEmpty(invitedPerson.homeAddress) ? "" :  invitedPerson.homeAddress,
                hasConfirmed : false,
                tableNumber : 0,
                wasInvited : false
            };
            contactsList.push(contact);
            InvitedService.sendSelectedContacts(contactsList, userId).then(function(){
              $scope.closeInvited();
              getContacts();
            });    
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

        function changeOriginalContact(currentContact, originalContact) {
            var contacts = [];
            currentContact.hasConfirmed = parseBoolToString(currentContact.hasConfirmed);
            currentContact.wasInvited = parseBoolToString(currentContact.wasInvited);
            currentContact.tableNumber = parseIntToString(currentContact.tableNumber);
            originalContact.custom_fields.id[0] = currentContact.contactId;
            originalContact.custom_fields.fullname[0] = currentContact.fullName;
            originalContact.custom_fields.phonenumber[0] = currentContact.phoneNumber;
            originalContact.custom_fields.mailaddress[0] = currentContact.mailAddress;
            originalContact.custom_fields.homeaddress[0] = currentContact.homeAddress;
            originalContact.custom_fields.hasconfirmed[0] = currentContact.hasConfirmed;
            originalContact.custom_fields.tablenumber[0] = currentContact.tableNumber;
            originalContact.custom_fields.wasinvited[0] = currentContact.wasInvited;
            contacts.push(originalContact);
            return contacts;
        }

        $scope.saveContact = function(currentContact) {
          $scope.invitedPerson = {
              contactId : $scope.invitedPerson.contactId,
              fullName : currentContact.fullName,
              phoneNumber : currentContact.phoneNumber,
              mailAddress : currentContact.mailAddress,
              homeAddress : currentContact.homeAddress ? currentContact.homeAddress : $scope.invitedPerson.homeAddress,
              hasConfirmed : $scope.invitedPerson.hasConfirmed,
              tableNumber : $scope.invitedPerson.tableNumber,
              wasInvited : $scope.invitedPerson.wasInvited
          };
          var originalContact = getOriginalCurrentContact($scope.invitedPerson),
              updatedContacts = changeOriginalContact($scope.invitedPerson, originalContact);
          InvitedService.saveContactChanges(userId, originalContact.id, updatedContacts).then(function(){
            $scope.closeInvited();
            getContacts();
          });      
        };

        $scope.removeContact = function(currentContact) {
          var originalContact = getOriginalCurrentContact(currentContact);
          var confirmPopup = $ionicPopup.confirm({
            title: 'Remove contact',
            template: 'Are you sure you want to remove <strong>' + currentContact.fullName + '</strong>?'
          });
          confirmPopup.then(function(res) {
            if(res) {
              InvitedService.removeContact(userId, originalContact.id).then(function(){
                getContacts();
              });
            } else {
              return;
            }
          });
        };

        $scope.changeInvitation = function(currentContact) {
          currentContact.wasInvited = !currentContact.wasInvited;
          var originalContact = getOriginalCurrentContact(currentContact),
              updatedContacts = changeOriginalContact(currentContact, originalContact);
          InvitedService.saveContactChanges(userId, originalContact.id, updatedContacts).then(function(){
            $scope.closeInvited();
            getContacts();
          });
        };

        $scope.changeConfirmation = function(currentContact) {
          currentContact.hasConfirmed = !currentContact.hasConfirmed;
          var originalContact = getOriginalCurrentContact(currentContact),
              updatedContacts = changeOriginalContact(currentContact, originalContact);
          InvitedService.saveContactChanges(userId, originalContact.id, updatedContacts).then(function(){
            $scope.closeInvited();
            getContacts();
          });
        };

        $scope.isEmpty = isEmpty;

        $scope.$watch('page.currentPage', function(){
            getContacts();
        });

    })

    .controller('LocationsCtrl', function ($scope, $stateParams, $ionicScrollDelegate, LocationsService) {

        var post_type = $stateParams.type,
            category_post_type = null;
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


        function initialize(post_type, category, currentPage) {
            LocationsService.getLocationByCategory(post_type, category, currentPage).then(function(data){
              $scope.locations = data.locations;
              $scope.totalItems = data.count;
              $scope.nrOfPages = data.pages;
              $ionicScrollDelegate.scrollTop(true);
            });
        };


        $scope.getLocationsByCategory = function(category) {
          category_post_type = category ? category.post_type : null;
          $scope.page = { currentPage : 1 };
          if (category !== null) {
              initialize(post_type, category.post_type, $scope.page.currentPage);
          } else {
              initialize(post_type, null, $scope.page.currentPage);
          }
        };

        $scope.$watch('page.currentPage', function(){
            initialize(post_type, category_post_type, $scope.page.currentPage);
        });

        getLocationCategories();

    })

    .controller('LocationCtrl', function ($scope, $q, $timeout, $state, $ionicModal, $stateParams, LocationsService) {
        var type = $stateParams.type,
            id = $stateParams.id;
        $scope.isCollapsed = true;

        function initialize() {
            LocationsService.getCurrentLocation(type, id).then(function(location){
              initMap(location);
                $scope.locationItem = location; 
            });
        }

        function getValidAddress(location) {

            var correctAddress = null,
                deferred = $q.defer(),
                address = _.isUndefined(location.address) ? location.city[0] : location.address[0] + ',' + location.city[0];
                LocationsService.checkAddressValidity(address).then(function(data){
                  if (data.status === 'OK') {
                    correctAddress = data.results[0].formatted_address;
                  } else {
                    correctAddress = 'Cluj-Napoca';
                  }
                  deferred.resolve(correctAddress);
                });

            return deferred.promise;
        }

        function initMap(location) {
            var map, geocoder;
            getValidAddress(location).then(function(address){
                geocoder = new google.maps.Geocoder();
                geocoder.geocode({ 'address':  address}, function (results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        var myOptions = {
                            zoom: 17,
                            center: results[0].geometry.location,
                            mapTypeId: google.maps.MapTypeId.ROADMAP
                        };
                        
                        map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);  
                    } else {
                        $scope.isCollapsed = true;
                        alert('Geocode was not successful for the following reason: ' + status);
                    }
                });
            });
        }

        $scope.getASimilarLocation = function(location) {
          LocationsService.getSimilarLocation(location.type, location.id).then(function(result){
            $state.go('menu.location', { type : result.type, id : result.id });        
            $scope.locationItem = result;
          });
        };

        $scope.showGoogleCalendar = function(location) {
            $scope.isCollapsed = !$scope.isCollapsed;
            if (!$scope.isCollapsed) {
                initMap(location);
            }      
        };

        $ionicModal.fromTemplateUrl('image-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.openModal = function() {
      $scope.modal.show();
    };

    $scope.closeModal = function() {
      $scope.modal.hide();
    };

        initialize();
    });

}).call(this, this.angular);