var express = require('express'),
app 		= require('express')(),
server 		= app.listen(process.env.PORT || 80),
io 			= require('socket.io')(server),
path 		= require('path'),
 mongoose    = require('mongoose'),
bodyParser 	= require('body-parser'),
crypto=require('crypto'),
publicPath 	= '/../public/',
liveCart
config=require('./config')



var auth=require('./controllers/auth');
var inventory=require('./controllers/inventory');
var transaction=require('./controllers/transaction');

//var checkAuthenticated=require('./services/checkAuthenticated');




//middleware
app.use(bodyParser.json());
app.use(function(req,res,next){
 	console.log(req.ip);
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Headers","Content-Type,Authorization");
    next();
}) 


app.use(express.static(path.resolve(__dirname + publicPath)))
app.use(express.static(path.resolve(__dirname + '/../bower_components')))

app.get('/', function (req, res) {

	res.sendFile(path.resolve(__dirname, publicPath, 'index.html'))
})


//auth endpoints
app.post('/auth/register',auth.register);
app.post('/auth/login',auth.login);
app.get('/auth/user/:id',auth.getById);
app.post('/auth/logout',auth.logout);
app.put('/auth/update',auth.update);
app.post('/auth/validate',auth.validate)

// Inventroy endpoints
app.post('/inventory/product',inventory.add);
app.get('/inventory/products',inventory.get);
app.get('/inventory/product/:productId',inventory.getProduct);
app.put('/inventory/product',inventory.update);
app.delete('/inventory/product/:productId',inventory.remove)


//transaction endpoints
app.get('/transactions/all',transaction.get);
app.get('/transactions/limit',transaction.limit);
app.get('/transactions/day-total',transaction.dayTotal);
app.get('/transactions/by-date',transaction.byDate);
app.post('/transactions/new',transaction.newTransaction);
app.get('/transactions/:transactionId',transaction.getById);
app.delete('/transactions/:id',transaction.remove)





// Websocket logic for Live Cart
io.on('connection', function (socket) {

	socket.on('cart-transaction-complete', function () {
		socket.broadcast.emit('update-live-cart-display', {})
	})

	// upon page load, give user current cart
	socket.on('live-cart-page-loaded', function () {
		console.log("live cart loaded")
		socket.emit('update-live-cart-display', liveCart)
	})

	// upon connecting, make client update live cart
	socket.emit('update-live-cart-display', liveCart)

	// when the cart data is updated by the POS
	socket.on('update-live-cart', function (cartData) {
		
		// keep track of it
		liveCart = cartData
		
		// broadcast updated live cart to all websocket clients
		socket.broadcast.emit('update-live-cart-display', liveCart)
	})

})




//connection
mongoose.connect(config.database,function(err,db){
    if(!err)
    {
        console.log("connected to "+config.database+" db");
        
       
    }
})



