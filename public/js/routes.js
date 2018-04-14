///////////////////////////////////////////////////
//////////////////  Routes  ////////////////// //
//////////////////////////////////////////////////

pos.config(['$stateProvider','$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {

    $stateProvider.
      state('login', {
        url: '/',
        templateUrl: 'templates/login.html',
      }).
      state('home', {
        url: '/home',
        templateUrl: 'templates/home.html',
        abstract: true,
        controller: 'inventoryController'
      }).
      state('home.inventory', {
        url: '/inventory',
        templateUrl: 'templates/inventory.html',
        controller: 'inventoryController'
      }).
      state('home.createProduct', {
        url: '/inventory/create-product',
        templateUrl: 'templates/inventory/create-product.html',
        controller: 'newProductController'
      }).
      state('home.editProduct', {
        url: '/inventory/product/:id',
        templateUrl: 'templates/inventory/edit-product.html',
        controller: 'editProductController'
      }).
      state('home.pos', {
        url: '/pos',
        templateUrl: 'templates/pos.html',
        controller: 'posController'
      }).
      state('home.liveCart', {
        url: '/live-cart',
        templateUrl: 'templates/live-cart.html',
        controller: 'liveCartController'
      }).
      state('home.transactions', {
        url: '/transactions',
        templateUrl: 'templates/transactions.html',
        controller: 'transactionsController'
      }).
      state('home.viewTransaction', {
        url: '/transaction/:id',
        templateUrl: 'templates/view-transaction.html',
        controller: 'viewTransactionController'
      }).
      state('home.userAccount', {
        url: '/user/:id',
        templateUrl: 'templates/directives/account-form.html',
        controller: 'accountController'
      }).
      state('home.analytics', {
        url: '/analytics',
        templateUrl: 'templates/analytics.html',
        controller: 'analyticsController'
      });
      $urlRouterProvider.otherwise('/');

  }]);
