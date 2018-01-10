///////////////////////////////////////////////////
//////////////////  Routes  ////////////////// //
//////////////////////////////////////////////////

pos.config(['$routeProvider',
  function($routeProvider) {

      $routeProvider.
        when('/', {
          templateUrl: 'templates/login.html',
        }).
         when('/home', {
          templateUrl: 'templates/home.html',
          controller: 'inventoryController',
        }).
        when('/inventory', {
          templateUrl: 'templates/inventory.html',
          controller: 'inventoryController',
        }).
        when('/inventory/create-product', {
          templateUrl: 'templates/inventory/create-product.html',
          controller: 'newProductController',
        }).
        when('/inventory/product/:productId', {
          templateUrl: 'templates/inventory/edit-product.html',
          controller: 'editProductController',
        }).
        when('/pos', {
          templateUrl: 'templates/pos.html',
          controller: 'posController',
        }).
        when('/live-cart', {
          templateUrl: 'templates/live-cart.html',
          controller: 'liveCartController',
        }).
        when('/transactions', {
          templateUrl: 'templates/transactions.html',
          controller: 'transactionsController',
        }).
        when('/transaction/:transactionId', {
          templateUrl: 'templates/view-transaction.html',
          controller: 'viewTransactionController',
        }).
        when('/analytics', {
          templateUrl: 'templates/analytics.html',
          controller: 'analyticsController',
        }).
        otherwise({
          redirectTo: '/'
        });
        
  }]);
