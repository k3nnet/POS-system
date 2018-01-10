var app 	= require('express')()
var server 	= require('http').Server(app)
var bodyParser = require('body-parser')
var Datastore = require('nedb')
var async = require('async')
var User=require('../models/user')

app.use(bodyParser.json())

module.exports = app;

app.get('/', function(req, res) {
    res.send('Hello! Mrichos Point of Sale system at http://localhost:' + port + '/api');
});

// route to authenticate a user (POST http://localhost:8080/api/authenticate)
app.post('/authenticate', function(req, res) {

  // find the user
  User.findOne({
    name: req.body.name
  }, function(err, user) {

    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {

      // check if password matches
      if (user.password != req.body.password) {
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
      } else {

        // if user is found and password is right
        // create a token with only our given payload
    // we don't want to pass in the entire user since that has the password
    const payload = {
      admin: user.admin 
    };
        var token = jwt.sign(payload, app.get('superSecret'));

        // return the information including token as JSON
        res.json({
          success: true,
          message: 'Enjoy your token!',
          token: token
        });
      }   

    }

  });
});



app.get('/setup',function (req,res) {

    //create a sample user

    var admin=new User({
        name:"admin",
        password:"admin",
        admin:true
    });

    admin.save(function(err){
        if(err) throw err;
        console.log("User saved successfully");
        res.json({success:true});
    })
    
});

app.get('/users', function(req, res) {
  User.find({}, function(err, users) {
    res.json(users);
  });
});



