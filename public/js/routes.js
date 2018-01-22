///////////////////////////////////////////////////
//////////////////  Routes  ////////////////// //
//////////////////////////////////////////////////

pos.config(['$stateProvider',
  function ($stateProvider) {

    $stateProvider.
      state('login', {
        url: '/',
        resolve:{
          user:['Auth','$q',function(Auth,$q){

            if(Auth.user){
              return $q.reject({authorized:true});
            }

          }]
        },
        templateUrl: 'templates/login.html',
      }).
      state('home', {
        url: '/home',
        templateUrl: 'templates/home.html',
        controller: 'inventoryController',
        resolve: {
          user: ['Auth', '$q', function (Auth, $q) {
            console.log(Auth.user)

            return Auth.user || $q.reject({ unAuthorized: true });
          }]
        }
      }).
      state('inventory', {
        url: '/inventory',
        templateUrl: 'templates/inventory.html',
        controller: 'inventoryController',
        resolve: {
          user: ['Auth', '$q', function (Auth, $q) {
            console.log(Auth.user)

            return Auth.user || $q.reject({ unAuthorized: true });
          }]
        }
      }).
      state('createProduct', {
        url: '/inventory/create-product',
        templateUrl: 'templates/inventory/create-product.html',
        controller: 'newProductController',
        resolve: {
          user: ['Auth', '$q', function (Auth, $q) {
            console.log(Auth.user)

            return Auth.user || $q.reject({ unAuthorized: true });
          }]
        }
      }).
      state('editProduct', {
        url: '/inventory/product/:id',
        templateUrl: 'templates/inventory/edit-product.html',
        controller: 'editProductController',
        resolve: {
          user: ['Auth', '$q', function (Auth, $q) {
            console.log(Auth.user)

            return Auth.user || $q.reject({ unAuthorized: true });
          }]
        }
      }).
      state('pos', {
        url: '/pos',
        templateUrl: 'templates/pos.html',
        controller: 'posController',
        resolve: {
          user: ['Auth', '$q', function (Auth, $q) {
            console.log(Auth.user)

            return Auth.user || $q.reject({ unAuthorized: true });
          }]
        }
      }).
      state('liveCart', {
        url: '/live-cart',
        templateUrl: 'templates/live-cart.html',
        controller: 'liveCartController',
        resolve: {
          user: ['Auth', '$q', function (Auth, $q) {
            console.log(Auth.user)

            return Auth.user || $q.reject({ unAuthorized: true });
          }]
        }
      }).
      state('transactions', {
        url: '/transactions',
        templateUrl: 'templates/transactions.html',
        controller: 'transactionsController'
      }).
      state('viewTransaction', {
        url: '/transaction/:id',
        templateUrl: 'templates/view-transaction.html',
        controller: 'viewTransactionController',
        resolve: {
          user: ['Auth', '$q', function (Auth, $q) {
            console.log(Auth.user)

            return Auth.user || $q.reject({ unAuthorized: true });
          }]
        }
      }).
      state('analytics', {
        url: '/analytics',
        templateUrl: 'templates/analytics.html',
        controller: 'analyticsController',
        resolve: {
          user: ['Auth', '$q', function (Auth, $q) {
            console.log(Auth.user)

            return Auth.user || $q.reject({ unAuthorized: true });
          }]
        }
      });

  }]);
