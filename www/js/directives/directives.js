(function(angular){

	'use strict';

	var module = angular.module('events.directives', []);

	module.directive('fallbackSrc', function () {
		return {
			restrict: 'A',
			link: function(scope, element, attrs){
				if(_.isEmpty(attrs.ngSrc)){
					element.attr('src', attrs.fallbackSrc);
				}
				element.bind('error', function(){
					element.attr('src', attrs.fallbackSrc);
				});
			}
		};
	});

	module.filter('htmlToPlaintext', function() {
		return function(text) {
			return String(text).replace(/<[^>]+>/gm, '');
		}
	});

}).call(this, this.angular);