var Transaction = require('../models/transaction');
var Inventory = require('./inventory')
module.exports = {
    //get all product from inventory
    get: function (req, res) {
        Transaction.find({}).exec(function (err, result) {

            res.send(result);

        })
    },//get all transactions
    limit: function (req, res) {
        console.log(req);
        var limit = parseInt(req.query.limit, 10)
        if (!limit) limit = 5

        Transaction.find({}).limit(limit).sort({ date: -1 }).exec(function (err, docs) {
            res.send(docs)
        })
    }, //add product to inventory
    newTransaction: function (req, res) {
        console.log(req.body);
        var transaction = new Transaction(req.body);
        transaction.save(transaction, function (err, result) {
            if (!err) {
                res.sendStatus(200)
                console.log("new transaction: " + transaction.products);
                Inventory.decrementInventory(transaction.products)
            }

            else {
                res.status(500).send(err)
            }
        });


    }, //get inventory product by id
    getProduct: function (req, res) {
        console.log(req.body);
        if (!req.params.productId) {
            res.status(500).send('ID field is required.')
        }
        else {
            Product.find({ _id: req.params.productId }).exec(function (err, result) {

                res.send(result);

            });
        }
    },//update inventory product
    updateProduct: function (req, res) {
        var productId = req.body._id;
        Product.update({ _id: productId }, { $set: new Product(req.body) }, { multi: false }).exec(function (err, results) {
            res.send(results);
        });

    },//Get total sales for the current day
    dayTotal: function (req, res) {
        // if date is provided
      //  console.log(req.query.date);
        if (req.query.date) {
            startDate = new Date(req.query.date)
            startDate.setHours(0, 0, 0, 0)

            endDate = new Date(req.query.date)
            endDate.setHours(23, 59, 59, 999)
        }
        else {

            // beginning of current day
            var startDate = new Date()
            startDate.setHours(0, 0, 0, 0)

            // end of current day
            var endDate = new Date()
            endDate.setHours(23, 59, 59, 999)
        }
        console.log("start: "+startDate.toUTCString());
         console.log("end: "+endDate.toUTCString());


        Transaction.find({ date: { $gte: startDate.toJSON(), $lte: endDate.toJSON() } }, function (err, docs) {

            var result = {
                date: startDate
            }

           // console.log("docs:" + docs);

            if (docs) {

                var total = docs.reduce(function (p, c) {
                    return p + c.total
                }, 0.00)
                console.log("Total: "+total);

                result.total = parseFloat(parseFloat(total).toFixed(2))

                res.send(result)
            }
            else {
                result.total = 0
                res.send(result)
            }
        })
    },//get single transaction
    getById: function (req, res) {
        Transaction.find({ _id: req.params.transactionId }, function (err, doc) {
            if (doc) {
                console.log("single doc " + doc)
                res.send(doc[0])
            }
        })
    },//get transaction for date
    byDate: function (req, res) {
        var startDate = new Date(2015, 2, 15)
        startDate.setHours(0, 0, 0, 0)

        var endDate = new Date(2015, 2, 15)
        endDate.setHours(23, 59, 59, 999)

        Transaction.find({ date: { $gte: startDate.toJSON(), $lte: endDate.toJSON() } }, function (err, docs) {
            if (docs)
                res.send(docs)
        })
    }




}
