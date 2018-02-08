var Inventory = require('../models/product');
var async = require('async')
module.exports = {
    //get all product from inventory
    get: function (req, res) {
        Inventory.find({}).exec(function (err, result) {

            res.send(result);

        })
    }, //add product to inventory
    add: function (req, res) {
        console.log(req.body);
        var product = new Inventory(req.body);
        product.save();
        res.status(200).send("success");

    }, //get inventory product by id
    getProduct: function (req, res) {
        console.log(req.body);
        if (!req.params.productId) {
            res.status(500).send('ID field is required.')
        }
        else {
            Inventory.find({ _id: req.params.productId }).exec(function (err, result) {

            res.send(result);

        });
        }
    },//update inventory product
    update:function(req,res){
        var productId = req.body._id;
        console.log(req.body);
          var product = new Inventory(req.body);
          Inventory.update({ _id: productId },{$set:req.body},{multi:false}).exec(function(err,results){
              res.send(results);
          });

    },//remove product from inventoty
    remove:function(req,res){

        Inventory.remove({ _id: req.params.productId }, function (err, numRemoved) {
		if (err) 
			res.status(500).send(err)
		else 
			res.sendStatus(200)
	})

    },
    decrementInventory:function(products){
        	async.eachSeries(products, function (transactionProduct, callback) {

                
		
		Inventory.find({_id: transactionProduct._id }).exec(function(err, results) {
			
            product=results[0];
            console.log("decrement"+JSON.stringify(product));
            console.log(product);
            
           
			// catch manually added items (don't exist in inventory)
			if (!product || !product.products_at_hand) {
                console.log("here")
				callback();
			}

			else {
                console.log("here herse")
				var updatedQuantity = parseInt(product.products_at_hand) - parseInt(transactionProduct.quantity)
                 console.log("updated  quantity"+updatedQuantity);
				  Inventory.update({ _id: product._id }, { $set: { products_at_hand: updatedQuantity } },{},callback);
			}

		});

	});
    },
    incrementInventory:function(products){
      	async.eachSeries(products, function (transactionProduct, callback) {

                
		
		Inventory.find({_id: transactionProduct._id }).exec(function(err, results) {
			
            product=results[0];
            console.log("incrementInventory"+JSON.stringify(product));
            console.log(product);
            
           
			// catch manually added items (don't exist in inventory)
			if (!product || !product.products_at_hand) {
                console.log("here")
				callback();
			}

			else {
                console.log("void")
				var updatedQuantity = parseInt(product.products_at_hand) + parseInt(transactionProduct.quantity)
                 console.log("updated  quantity"+updatedQuantity);
				  Inventory.update({ _id: product._id }, { $set: { products_at_hand: updatedQuantity } },{},callback);
			}

		});

	});

    }




}