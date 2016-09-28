'use strict';

var myApp = angular.module('myApp.controllers', ['fhcloud']);

myApp.controller('MainCtrl', function ($rootScope, $scope, $ionicLoading, $ionicModal, $ionicPopup, $timeout, fhcloud) {


// An alert dialog
 $scope.showAlertThankYou = function() {
   var alertPopup = $ionicPopup.alert({
     title: '<h4>CONGRATULATIONS</h4>',
     cssClass: 'showAlertThankYou',
     template: '<img src="img/medals-1622902_640_narrow.png" style="width: 230px; align: center;"/>',
     buttons: [
       /**{
         text: 'OK',
         type: 'button-assertive'
      } */
     ]
   });

   alertPopup.then(function(res) {
     console.log('Thank you for not eating my delicious ice cream cone');
   });
 };

  $scope.showSucces = function () {
    $ionicLoading.show({
      template: '<div class="ion-checkmark">&nbsp;Success</div>',
      duration: 1000
    });
  };

  $scope.showFailed = function () {
    $ionicLoading.show({
      template: '<div class="ion-minus-circled">&nbsp;Login Failed</div>',
      duration: 1500
    });
  };

  // Show loading...
  $scope.show = function () {
    $ionicLoading.show({
      template: 'Loading...'
    });
  };

  // Hide loading...
  $scope.hide = function () {
    $ionicLoading.hide();
  };

  /**
 * ACCIDENT PRICING
 */
  $scope.accidentPricing = {
    age: '36',
    amountCovered: '50.000',
    duration: '5',
    tariff: 'Standard',
    premium: '',
    messages: [],
    isCalculated: false,
    calculationCount: 0,
  }

  $scope.recalculateAccidentPricing = function () {
    if ($scope.accidentPricing.isCalculated) {
      // Call calculate
      $scope.calculateAccidentPricing();
    }
  }

  $scope.calculateAccidentPricing = function () {
    // Show loading indicator
    $scope.show();

    // Call MBaaS
    $fh.cloud({
      "path": "/pricing/calculate",
      "method": "POST",
      "contentType": "application/json",
      "data": {
        "params": {
          "username": window.localStorage.getItem("customer_bpm_username"),
          "password": window.localStorage.getItem("customer_bpm_password")
        },
        "alter": $scope.accidentPricing.age,
        "grundsumme": $scope.accidentPricing.amountCovered,
        "tarif": $scope.accidentPricing.tariff,
        "dauer": $scope.accidentPricing.duration
      },
      "timeout": 25000
    }, function (res) {
      if (res.code == 'ECONNREFUSED') {
        $scope.noticeMessage = 'Connection to mBaaS refused.';
        // Clear loading
        $scope.hide();
      } else if (res == 'Unauthorized') {
        $scope.noticeMessage = 'Authentication Error';
        // Clear loading
        $scope.hide();
      } else if (res.error != null) {
        $scope.noticeMessage = 'Connection to BPM refused.'
        // Clear loading
        $scope.hide();
      } else {
        $scope.noticeMessage = null;
        $scope.accidentPricing.premium = res.beitrag;
        $scope.accidentPricing.messages = res.msg;
        $scope.accidentPricing.isCalculated = true;

        // Postprocess data
        $scope.accidentPricing.premium = $scope.accidentPricing.premium.toString().replace('.', ',');
        $scope.accidentPricing.premium.split(',')[1].length < 2 ? $scope.accidentPricing.premium += '0' : true;

        // Clear loading
        $scope.hide();

        // Show CONGRATULATIONS on a random basis
        $scope.accidentPricing.calculationCount++;
        if ($scope.accidentPricing.calculationCount > 5) {
          if (parseInt((Math.random()*10).toString().split('.')[0]) > 5) {
            $scope.showAlertThankYou();
          }
        }
      }
    }, function (msg, err) {
      $scope.noticeMessage = "$fh.cloud failed. Error: " + JSON.stringify(err);
      // Clear loading
      $scope.hide();
    });
  };
});