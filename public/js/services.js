///////////////////////////////////////////////////
//////////////////  Services  ////////////////// //
////////////////////////////////////////////////////

Array.prototype.remove = function (from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

pos.service('Inventory', ['$http', function ($http) {

  var apiInventoryAddress = '/inventory';

  this.getProducts = function () {
    return $http.get(apiInventoryAddress + '/products').then(function (res) {
      return res.data;
    });
  };

  this.getProduct = function (productId) {
    var url = apiInventoryAddress + '/product/' + productId;
    return $http.get(url).then(function (res) {
      return res.data;
    });
  };

  this.updateProduct = function (product) {
    return $http.put(apiInventoryAddress + '/product', product).then(function (res) {
      return res.data;
    });
  };

  this.decrementQuantity = function (productId, quantity) {
    return $http.put(apiInventoryAddress + '/product', product).then(function (res) {
      return res.data;
    });
  };

  this.createProduct = function (newProduct) {
    newProduct.products_sold = '0';
    return $http.post(apiInventoryAddress + '/product', newProduct).then(function (res) {
      return res.data;
    });
  };

  this.removeProduct = function (productId) {
    return $http.delete(apiInventoryAddress + '/product/' + productId).then(function (res) {
      return res.data;
    });
  };

}]);

pos.factory('Auth', ['$http', '$cookieStore', function ($http, $cookieStore) {

  //endpoints

  var authApiUrl = '/auth/';

  var auth = {};


  //login user
  auth.login = function (user) {
    var url = authApiUrl + 'login';

    return $http.post(url, { params: { email: user.name, password: user.password } }).then(function (res) {
      console.log(res);
      auth.user = res.data
      $cookieStore.put('user', auth.user);

      return auth.user;
    });
  }


  //logout user
  auth.logout = function () {
    return $http.post(authApiUrl + 'logout').then(function (response) {
      console.log(response.data)
      auth.user = undefined;
      $cookieStore.remove('user');
    })

  }

  return auth;

}]);




pos.service('Transactions', ['$http', function ($http, Inventory) {

  var transactionApiUrl = '/transactions/';

  this.getAll = function () {
    var url = transactionApiUrl + 'all';

    return $http.get(url).then(function (res) {
      return res.data;
    });
  };

  this.get = function (limit) {
    var url = transactionApiUrl + 'limit';

    return $http.get(url, { params: { limit: limit } }).then(function (res) {
      return res.data;
    });
  };

  this.getTotalForDay = function (date) {

    var url = transactionApiUrl + 'day-total';

    return $http.get(url).then(function (res) {
      return res.data;
    });
  };

  this.getOne = function (transactionId) {
    var url = transactionApiUrl + transactionId;

    return $http.get(url).then(function (res) {
      return res.data;
    });
  };

  this.add = function (transaction) {
    return $http.post(transactionApiUrl + 'new', transaction).then(function (res) {
      return res.data;
    });
  };

}]);

pos.service('Settings', ['$http', function ($http) {

  var settingsFile = 'settings.json';

  this.get = function () {
    return $http.get(settingsFile).then(function (res) {
      return res.data;
    });
  }

}]);