var pos = angular.module('POS', [
  'ngRoute',
  'ngAnimate',
  'lr.upload',
  'ui.odometer',
]);


pos.constant("moment",moment);   

///////////////////////////////////////////////////
////////////////// Socket.io ////////////////// //
//////////////////////////////////////////////////

var   serverAddress = 'http://localhost:80';

var socket = io.connect(serverAddress);


/////////////////////////////////////////////////////
////////////////// Controllers ////////////////// //
////////////////////////////////////////////////////

pos.controller('body', function ($scope, $location, Settings) {

  $scope.onHomePage = function () {
    return ($location.path() === '/' || $location.path() === '#/');
  };

  Settings.get().then(function (settings) {
    $scope.settings = settings;
  });

});


pos.controller('loginController', function ($scope, $location, $http,Auth) {


    $scope.login=function(user){


        Auth.login(user).then(function(results){
          console.log("results: "+results.success);

          if(results.success){
             $location.path('/home');

          }else{
            console.log(results.message);
            $scope.message=results.message;

          }

           

        });
      }
})

// Inventory Section

pos.controller('inventoryController', function ($scope, $location, Inventory) {

  // get and set inventory
  Inventory.getProducts().then(function (products) {
    $scope.inventory = angular.copy(products);
  });

  // go to edit page
  $scope.editProduct = function (productId) {
    $location.path('/inventory/product/' + productId);
  };

});

pos.controller('newProductController', function ($scope, $location, $route, Inventory) {

  $scope.addMultipleProducts = false;

  $scope.createProduct = function (product) {

    Inventory.createProduct($scope.newProduct).then(function (product) {

      if ($scope.addMultipleProducts) refreshForm();
      else $location.path('/inventory');

    });

  };

  var refreshForm = function () {
    $scope.newProuct = {};
  };

});



pos.controller('editProductController', function ($scope, $location, $routeParams, Inventory, upload) {

  console.log("route parameters:"+JSON.stringify($routeParams))
  // get and set inventory
  Inventory.getProduct($routeParams.productId).then(function (product) {
    $scope.product = angular.copy(product[0]);
    console.log("from edit controler"+JSON.stringify(product[0]));
  });

  $scope.saveProduct = function (product) {

    Inventory.updateProduct(product).then(function (updatedProduct) {
      console.log('updated!');
    });

    $location.path('/inventory');
  };

  $scope.deleteProduct = function () {
    Inventory.removeProduct($scope.product._id).then(function () {
      $location.path('/inventory');
    });
  };


  $scope.doUpload = function () {
    console.log('yoyoyo');

    upload({
      url: '/upload',
      method: 'POST',
      data: {
        anint: 123,
        aBlob: Blob([1, 2, 3]), // Only works in newer browsers
        aFile: $scope.product.image, // a jqLite type="file" element, upload() will extract all the files from the input and put them into the FormData object before sending.
      }
    }).then(
      function (response) {
        console.log(response.data); // will output whatever you choose to return from the server on a successful upload
      },
      function (response) {
        console.error(response); //  Will return if status code is above 200 and lower than 300, same as $http
      }
      );
  }

});

// POS Section
pos.controller('posController', function ($scope, $location, Inventory, Transactions) {

  $scope.scan = false;
  $scope.scanIcon = "glyphicon glyphicon-plus";
  $scope.scanText = "Open Scanner";
  $scope.subText = "Enter item barcode";
  $scope.boxText = "Entered barcode";
  $scope.addButton = "true";
  $scope.showScanner = function () {

    if ($scope.scan === true) {
      $scope.scan = false;
      $scope.scanText = "Open Scanner"
      $scope.scanIcon = "glyphicon glyphicon-plus";
      $scope.subText = "Enter item barcode";
      $scope.boxText = "Entered barcode";
    }
    else {
      $scope.scan = true;
      $scope.addButton = false;
      $scope.scanText = "close Scanner"
      $scope.scanIcon = "glyphicon glyphicon-minus";
      $scope.subText = "Scan item barcode";
      $scope.boxText = "Scanned barcode";
    }

    var scanner = new Instascan.Scanner({ video: document.getElementById('preview') });
    scanner.addListener('scan', function (content, image) {
      console.log(content);
      var barcode = content.trim();
      $scope.barcode = barcode;
      // if the barcode accumulated so far is valid, add product to cart
      if ($scope.isValidProduct($scope.barcode)) $scope.addProductToCart($scope.barcode);
      else
        console.log('invalid barcode: ' + $scope.barcode);
      // $scope.barcodeNotFoundError = true;

      $scope.barcode = '';
      $scope.$digest();

    });

    Instascan.Camera.getCameras().then(function (cameras) {
      if (cameras.length > 0) {
        scanner.start(cameras[0]);
      }
    });



  };




  $scope.barcodeHandler = function () {

    if ($scope.isValidProduct($scope.barcode)) {
       $scope.addProductToCart($scope.barcode); 
      }
    else {
      console.log('invalid barcode: ' + $scope.barcode);
    }
         $scope.barcode = '';
      $scope.$digest();

  }
  function barcodeHandler(e) {

    $scope.barcodeNotFoundError = false;

    // if enter is pressed
    if (e.which === 13) {

      // if the barcode accumulated so far is valid, add product to cart
      if ($scope.isValidProduct($scope.barcode)) $scope.addProductToCart($scope.barcode);
      else
        console.log('invalid barcode: ' + $scope.barcode);
      // $scope.barcodeNotFoundError = true;

      $scope.barcode = '';
      $scope.$digest();
    }
    else {
      $scope.barcode = "" ;
    }

  }

  $(document).on('keypress', barcodeHandler);

  var rawCart = {
    products: [],
    total: 0,
    total_tax: 0,
  };

  var startCart = function () {
    var cartJSON = localStorage.getItem('cart');

    if (cartJSON) {
      $scope.cart = JSON.parse(cartJSON);
    }
    else {
      $scope.cart = angular.copy(rawCart);
    }

  };

  var startFreshCart = function () {
    localStorage.removeItem('cart');
    $scope.cart = angular.copy(rawCart);
    $scope.updateCartTotals();
    $('#barcode').focus();
  };

  $scope.refreshInventory = function () {
    Inventory.getProducts().then(function (products) {
      $scope.inventory = angular.copy(products);
      $scope.inventoryLastUpdated = new Date();
    });
  };

  $scope.refreshInventory();

  startCart();

  var addProductAndUpdateCart = function (product) {
    $scope.cart.products = $scope.cart.products.concat([product]);
    $scope.updateCartTotals();
    $scope.barcode = '';
  };

  $scope.cleanProduct = function (product) {
    product.cart_item_id = $scope.cart.products.length + 1;
    console.log(product)

    if (product.food) product.tax_percent = 0;
    else product.tax_percent = .08;

    delete product.quantity_on_hand;
    delete product.food;
    console.log(product)
    return product;
  };

  var productAlreadyInCart = function (barcode) {
    var product = _.find($scope.cart.products, { barcode: barcode.toString() });

    if (product) {
      product.quantity = product.quantity + 1;
      $scope.updateCartTotals();
    }

    return product;
  };

  $scope.addProductToCart = function (barcode) {

    if (productAlreadyInCart(barcode)) return;
    else {
      var product = angular.copy(_.find($scope.inventory, { barcode: barcode.toString() }));
      console.log("before clean operations:");
      console.log(JSON.stringify(product));
      product = $scope.cleanProduct(product);
      console.log("after clean operations:");
      console.log(JSON.stringify(product));
      product.quantity = 1;
      addProductAndUpdateCart(product);
    }
  };

  $scope.addManualItem = function (product) {
    product.quantity = 1;
    product = $scope.cleanProduct(product)
    addProductAndUpdateCart(product);
  };

  $scope.removeProductFromCart = function (productIndex) {
    $scope.cart.products.remove(productIndex);
    $scope.updateCartTotals();
  };

  $scope.isValidProduct = function (barcode) {
    return _.find($scope.inventory, { barcode: barcode.toString() });
  };

  var updateCartInLocalStorage = function () {
    var cartJSON = JSON.stringify($scope.cart);
    localStorage.setItem('cart', cartJSON);
    socket.emit('update-live-cart', $scope.cart);
  };

  $scope.updateCartTotals = function () {
    $scope.cart.total = _.reduce($scope.cart.products, function (total, product) {
      var weightedPrice = parseFloat(product.price * product.quantity);
      var weightedTax = parseFloat(weightedPrice * product.tax_percent);
      var weightedPricePlusTax = weightedPrice + weightedTax;
      return total + weightedPricePlusTax;
    }, 0);

    $scope.cart.total_tax = _.reduce($scope.cart.products, function (total, product) {
      var weightedPrice = parseFloat(product.price * product.quantity);
      var weightedTax = parseFloat(weightedPrice * product.tax_percent);
      return total + weightedTax;
    }, 0);

    updateCartInLocalStorage();
  };

  $scope.printReceipt = function (payment) {
    // print receipt
    var cart = angular.copy($scope.cart);
    cart.payment = angular.copy(payment);
    cart.date = new Date();

    //update product


    // save to database
    Transactions.add(cart).then(function (res) {

      socket.emit('cart-transaction-complete', {});

      // clear cart and start fresh
      startFreshCart();

    });

    $scope.refreshInventory();
  };

  function genOrderNo(cart){

     
  }

  $scope.addQuantity = function (product) {
    product.quantity = parseInt(product.quantity) + 1;
    $scope.updateCartTotals();
  };

  $scope.removeQuantity = function (product) {
    if (parseInt(product.quantity) > 1) {
      product.quantity = parseInt(product.quantity) - 1;
      $scope.updateCartTotals();
    }
  };

});

pos.controller('transactionsController', function ($scope, $location, Transactions) {

  Transactions.getAll().then(function (transactions) {
    $scope.transactions = _.sortBy(transactions, 'date').reverse();
  });

  // get yesterday's date
  var yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  Transactions.getTotalForDay().then(function (dayTotal) {
    $scope.todayTotal = dayTotal.total;
  });

  Transactions.getTotalForDay(yesterday).then(function (dayTotal) {
    $scope.yesterdayTotal = dayTotal.total;
  });

  $scope.getNumberOfProducts = function (products) {
    return _.reduce(products, function (s, product) {
      return s + product.quantity;
    }, 0);
  };

});

pos.controller('viewTransactionController', function ($scope, $routeParams, Transactions) {

  var transactionId = $routeParams.transactionId;

  Transactions.getOne(transactionId).then(function (transaction) {
    $scope.transaction = angular.copy(transaction);
  });

});

pos.controller('analyticsController',function($scope){


   
queue()
    .defer(d3.json, "/transactions/all")
    .await(makeGraphs);

function makeGraphs(error, apiData) {

	//Start Transformations
	var dataSet = apiData;

	var productsData=[];
	var dayFormat = d3.time.format("%a-%U-%y");
  var dateFormat = d3.time.format("%d-%b-%Y");
	dataSet.forEach(function (d) {
		d.date = new Date(d.date);
   //    console.log(d);


	//	d.date =dateFormat(d.date);
	

		var count=0;
	
		console.log(d.date);
		d.products.forEach(function(b){
      b.date=dateFormat(d.date);
      b.month =dateFormat(d.date).slice(3, 6);
      b.day= dayFormat(d.date).slice(0,3);
      b.year=dateFormat(d.date).slice(7, 11);
      b.week=dayFormat(d.date).slice(4, 6);

      b.price=+b.price;
      b.total=b.price*b.quantity;
			productsData.push(b);
			count++;
			////console.log("quantity: "+b.quantity+" total: "+d.total);
			console.log(b);
		})
		
		
	
		
	});


	//print helper function

    var print_filter = function (filter) {
		var f = eval(filter);
		if (typeof (f.length) != "undefined") { } else { }
		if (typeof (f.top) != "undefined") { f = f.top(Infinity); } else { }
		if (typeof (f.dimension) != "undefined") { f = f.dimension(function (d) { return ""; }).top(Infinity); } else { }
		console.log(filter + "(" + f.length + ") = " + JSON.stringify(f).replace("[", "[\n\t").replace(/}\,/g, "},\n\t").replace("]", "\n]"));
	}
	//Create a Crossfilter instance
	console.log(productsData.length);

	var ndx = crossfilter(dataSet);
	var mdx=crossfilter(productsData);




	//Define Dimensions

  var allDim=mdx.dimension(function(d){
    return d;
  })

  var dayDim=mdx.dimension(function(d){
    return d.day;
  })

  var weekDim=mdx.dimension(function(d){
    return d.week;
  })

	var monthDim = mdx.dimension(function (d) {
    //console.log(d);
		return d.month;
	})

  var yearDim=mdx.dimension(function(d){
    return d.year;
  })
	var dateDim = mdx.dimension(function (d) {
		////console.log(d.total);
		return d.date;
	});

  var productNameDim=mdx.dimension(function(d){
    console.log(d);
    
    return d.name;
  })

  var priceTotalDim=mdx.dimension(function(d){
    return d.total;
  })

  var quantityDim=mdx.dimension(function(d){
    return d.quantity;
  })

  var barcodeDim=mdx.dimension(function(d){
    return d.barcode;
  })







	//Calculate metrics
	var productsByName = productNameDim.group();
	var productsByQuantity =quantityDim.group();
  var productByDate=dateDim.group();
  var monthGroup=monthDim.group();
  var productByBarcode=barcodeDim.group()
  var dayGroup=dayDim.group();
  var weekGroup=weekDim.group();
  var dayGroup=dayDim.group();
  

	

	var all = mdx.groupAll();

	//Calculate Groups

  var netTotal=mdx.groupAll().reduceSum(function(d){

    return d.total;
  });

  var netQauntity=mdx.groupAll().reduceSum(function(d){
    return d.quantity;
  });


	var quantityPerCode = barcodeDim.group().reduceSum(function (d) {
	
		return d.quantity;
	});

  
	var quantityPerProduct = productNameDim.group().reduceSum(function (d) {
	
		return d.quantity;
	});

  var totalPerProduct=productNameDim.group().reduceSum(function(d){
   //console.log("total: "+d.total);
    return d.total;
  })



  var totalPerMonth=monthDim.group().reduceSum(function(d){
    //d.total=d.price*d.quantity;
    return d.total;
  })

  var totalPerDate=dateDim.group().reduceSum(function(d){
    return d.total;
  })

    var totalPerDay=dayDim.group().reduceSum(function(d){
    return d.total;
  })


   var quantityPerDate=dateDim.group().reduceSum(function(d){
   // d.total=d.price*d.quantity;
    return d.quantity;
  })

  var totalPerDay=dayDim.group().reduceSum(function(d){
    return d.total;
  })

var qtyPerMonth=monthDim.group().reduceSum(function(d){
  
  return d.quantity;
})


  console.log(netTotal.value())
	print_filter('allDim')
  



   
   $scope.revenue=netTotal.value();
  // $scope.totalTransactions=netQauntity;
  
	//Define threshold values for data
	var minDate = dateDim.bottom(1)[0].date;
	var maxDate = dateDim.top(1)[0].date;

	console.log(minDate);
	console.log(maxDate);

    //Charts
var productQuantity = dc.barChart("#state-donations");
	var fundingStatusChart = dc.pieChart("#funding-chart");
  var resourceTypeChart = dc.rowChart("#resource-chart");

  	var revenue = dc.numberDisplay("#revenue");
	var sales = dc.numberDisplay("#totalQty");
  var totalRevenue=dc.numberDisplay("#totalRevenue")
  var totalSales=dc.numberDisplay("#totalSales")

  


  sales
		.formatNumber(d3.format("d"))
		.valueAccessor(function(d){return d; })
		.group(netQauntity);

	revenue
		.formatNumber(d3.format("d"))
		.valueAccessor(function(d){return d; })
		.group(netTotal)


    totalRevenue
    .formatNumber(d3.format("d"))
    .valueAccessor(function(d){return d;})
    .group(netTotal)

    totalSales
    .formatNumber(d3.format("d"))
    .valueAccessor(function(d){return d;})
    .group(netQauntity)
	
  

  
 

     




  resourceTypeChart
        //.width(300)
        .height(220)
         .dimension(productNameDim)
        .group(quantityPerProduct)
        .elasticX(true)
        .xAxis().ticks(5);


	fundingStatusChart
		.height(220)
		//.width(350)
		.radius(100)
		.innerRadius(40)
		.transitionDuration(1000)
	   .dimension(productNameDim)
      .group(quantityPerProduct)
      .externalLabels(10)
      .legend(dc.legend())
      

     productQuantity
		//.width(800)
        .height(220)
        .transitionDuration(1000)
         .dimension(dayDim)
        .group(totalPerDay,"total")
        .margins({ top: 10, right: 50, bottom: 30, left: 50 })
        .centerBar(false)
        .gap(5)
        .elasticY(true)
        .elasticX(true)
        .x(d3.scale.ordinal().domain(dateDim))
        .xUnits(dc.units.ordinal)
        .yAxisLabel("total per Day (R)")
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)
        .ordering(function (d) { return d.date; })
        .yAxis().tickFormat(d3.format("s"));




    dc.renderAll();

};
})

pos.controller('liveCartController', function ($scope, Transactions, Settings) {

  $scope.recentTransactions = [];

  var getTransactionsData = function () {
    Transactions.get(10).then(function (transactions) {
      $scope.recentTransactions = _.sortBy(transactions, 'date').reverse();
    });

    Transactions.getTotalForDay().then(function (dayTotal) {
      $scope.dayTotal = dayTotal.total;
    });
  };
  console.log("live cart")

  // tell the server the page was loaded.
  // the server will them emit update-live-cart-display
  socket.emit('live-cart-page-loaded', { forreal: true });

  // update the live cart and recent transactions
  socket.on('update-live-cart-display', function (liveCart) {
    $scope.liveCart = liveCart;
    getTransactionsData();
    $scope.$digest();
  });

});
