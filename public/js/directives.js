///////////////////////////////////////////////////
////////////////// Directives ////////////////// //
////////////////////////////////////////////////////

pos.directive('navMenu',function ($location,Auth,$state,$cookieStore) {
  return {
    restrict: 'E',
    scope: {
    },
    templateUrl: 'templates/directives/nav-menu.html',
    link: function (scope) {

     
     scope.user=$cookieStore.get('user').user;

      scope.isActive = function (url) {
        if (url === 'transactions')
          url = 'transaction';
        
        url = '/' + url;
        return $location.path().indexOf(url) !== -1;
      }

      scope.account=function(_id){
        $state.go('userAccount',{id:_id});
        console.log(_id);
      }

      scope.logout=function(){
       
        Auth.logout();
       

      }

    }
  };

});

pos.directive('productForm',function ($location) {
  return {
    restrict: 'E',
    scope: {
      product: '=',
      onSave: '&'
    },
    templateUrl: 'templates/directives/product-form.html',
    link: function (scope, el) {

      // highlight barcode field
      var $barcode = $('#barcode');
      var $name = $('#name');
      $barcode.select();

      scope.tabOnEnter = function ($event) {
        if ($event.keyCode === 13) {
          $name.select(); 
          $event.preventDefault();
        }
      };

      scope.save = function () {

        scope.product.barcode=scope.product.barcode.toUpperCase();
       
        scope.onSave({ product: scope.product });
      };

    }
  };

});

pos.directive('addManualItem',function () {
  return {
    restrict: 'E',
    scope: {
      addItem: '&'
    },
    templateUrl: 'templates/directives/add-manual-item.html',
    link: function (scope, el) {
      
   //   scope.manualItem.price="place gikse";

   scope.showModal=function(){
 $('#myModal').appendTo('body').modal('show');
   }
    
      scope.add = function () {
       
        scope.manualItem.name = "Other";
        scope.addItem({item: scope.manualItem});
        $('#myModal').modal('hide');
        scope.manualItem = '';
      };

    }
  };

});

pos.directive('login',function (Auth,$state) {
  return {
    restrict: 'E',
    scope: {
    },
    templateUrl: 'templates/directives/login.html',
    link: function (scope, elem,attr) {


      


    

      scope.login = function (user) {
       


        Auth.login(user).then(function(results){
         console.log(results)

        
        if(!results.success){
           console.log("results: "+results);
           scope.message=results.message;
        }else{ 
            console.log("results: "+results.success); 
            $state.go('home.pos');
            this.closeModal();
           
           
        }

           

        });


       closeModal= function(){
                  elem.find('div').eq(0).modal('hide');
        }
      
          
      
       
      };

     
    }
  };

});

pos.directive('checkout', function (Settings) {
  return {
    restrict: 'E',
    scope: {
      printReceipt: '&',
      cartTotal: '='
    },
    templateUrl: 'templates/directives/checkout.html',
    link: function (scope, el) {
      
      $paymentField = el.find('form').eq(0).find('input').eq(0);

     



      
      scope.focusPayment = function () {
        $('#checkoutModal').appendTo('body');
        $('#checkoutPaymentAmount').select();
      };
      
      scope.getChangeDue = function () {
        if (scope.paymentAmount && scope.paymentAmount > scope.cartTotal) {
          var change =  parseFloat(scope.paymentAmount) - parseFloat(scope.cartTotal);
          return change;
        }
        else 
          return 0;
      };

      scope.print = function () {
        if (scope.cartTotal > scope.paymentAmount) return;

        var paymentAmount = angular.copy(scope.paymentAmount);

        scope.previousCartInfo = {
          total: angular.copy(scope.cartTotal),
          paymentAmount: paymentAmount,
        };

        scope.printReceipt({ payment: paymentAmount });
        scope.transactionComplete = true;
      };

      scope.closeModal = function () {
        $('#checkoutModal').modal('hide');
        delete scope.paymentAmount;
        scope.transactionComplete = false;
      };

    }
  };

});

pos.directive('receipt',function (Settings,Transactions,$state) {
  return {
    restrict: 'E',
    scope: {
      transaction: '='
    },
    templateUrl: 'templates/directives/receipt.html',
    link: function (scope,el) {




     scope.openVoid=function(){
       $('#validationDialog').appendTo('body').modal('show');
     }

       scope.validate=function(user ){
         Transactions.validate(user).then(function(result){
           console.log(result);
           var transaction=scope.transaction;
           if(result.success){
              Transactions.remove(transaction._id).then(function(result){
            console.log(result);
           $('#validationDialog').modal('hide');
            $state.go('home.transactions');
             });
             
           }
           else{
             scope.message="Sorry!we couldn't authorize you.please call your senior for assistance"

           }
         });


          
      }

        closeModal = function () {
        $('#validationDialog').modal('hide');
      
      };



     

      scope.backupDate = new Date();
      
      Settings.get().then(function (settings) {
        scope.settings = settings;
      });
      
    }
  };

});