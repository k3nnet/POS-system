var express = require('express');
var app = require('express')();
var server = require('http').Server(app);
var path = require('path');
bodyParser = require('body-parser'),
  morgan = require('morgan');
mongoose = require('mongoose');
jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
config = require('../config'); // get our config file
var User = require('../models/user')


module.exports = app;

app.set('superSecret', config.secret); // secret variable

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));


//middleware

app.use(function (req, res, next) {

  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  next();
});

app.use('/inventory', require('./inventory'));
app.use('/transactions', require('./transactions'));



app.use(function (req, res, next) {

  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), function (err, decoded) {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).send({
      success: false,
      message: 'No token provided.'
    });

  }
});








