'use strict';

var app = angular.module('exampleApp', ['JSONedit']);

function MainViewCtrl($scope, $filter) {

    // example JSON
    $scope.jsonData = {
        //"a":"b"
        /*  Pre defined nested json */
    };

    $scope.$watch('jsonData', function(json) {
        $scope.jsonString = $filter('json')(json);
    }, true);
    
    $scope.$watch('jsonString', function(json) {
        try {
            $scope.jsonData = JSON.parse(json);
            $scope.wellFormed = true;
        } catch(e) {
            $scope.wellFormed = false;
        }
    }, true);
}
