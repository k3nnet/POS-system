
var User = require('../models/user');

var jwt = require('jwt-simple');

var moment = require('moment');
module.exports = {


    register: function (req, res) {

        console.log(req.body.email);

        //check if the user already exist

        User.findOne({ email: req.body.email }, function (err, existingUser) {

            if (existingUser) {
                return res.status(409).send({ message: "email already registerd" })
            }
            var user = new User(req.body);


            user.save(function (err, result) {
                if (err) {
                    res.status(500).send({ message: err.message });
                }
                res.status(200).send({ token: createToken(result) });

            })

        })



    },

    login: function (req, res) {
      console.log(req.body.params);

        // find the user
        User.findOne({
            email: req.body.params.email
        }, function (err, user) {

            if (err) throw err;

            if (!user) {
                res.json({ success: false, message: 'Authentication failed. User not found.' });
            } else if (user) {

                // check if password matches
                if (user.password != req.body.params.password) {
                    res.json({ success: false, message: 'Authentication failed. Wrong password.' });
                } else {

                    // if user is found and password is right
                    // create a token with only our given payload
                    // we don't want to pass in the entire user since that has the password
                    const payload = {
                        admin: user.admin
                    };
                    var token = createToken(user)

                    // return the information including token as JSON
                    res.json({
                        success: true,
                        message: 'Enjoy your token!',
                        token: token
                    });
                }

            }

        });
    }
}

//function that creates a token for a user
function createToken(user) {
    var payload = {
        sub: user._id,
        iat: moment().unix(),
        exp: moment().add(14, 'days').unix()

    };
    return jwt.encode(payload, 'secret');
}