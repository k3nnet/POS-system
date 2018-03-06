
var User = require('../models/user');
var crypto = require('crypto');

var jwt = require('jwt-simple');

var moment = require('moment');
module.exports = {



    update: function (req, res) {


  

        User.findOne({ _id: req.body._id }, function (err, existingUser) {

            if (existingUser) {
             
                if (!(existingUser.password === req.body.password)) {

                    var passwordData = saltHashPassword(req.body.password);
                    var newUser = {
                        email: req.body.email,
                        password: passwordData.passwordHash,
                        salt: passwordData.salt,
                        role: req.body.role,
                        fullname: req.body.fullname

                    }


                    console.log("password changed")
                }
                else {

                    var newUser = {
                        email: req.body.email,
                        password: req.body.password,
                        salt: req.body.salt,
                        role: req.body.role,
                        fullname: req.body.fullname

                    }
                    console.log("password did not changed but other data did")
                }
                //var user = new User(newUser);


                User.update({ _id: req.body._id }, { $set: newUser }, { multi: false }).exec(function (err, results) {
             

                    if(results.nModified==1){
                       console.log("changed")
                       res.send({message:"successful"});
                    }else{
                        res.send({message:"unsuccessful"});

                    }

                    
                });

            } else {
                return res.status(409).send({ message: "cannot find user" })
            }




        })


    },


    register: function (req, res) {

      


        //check if the user already exist

        User.findOne({ email: req.body.email }, function (err, existingUser) {

            if (existingUser) {
                return res.status(409).send({ message: "email already registerd" })
            }

            var passwordData = saltHashPassword(req.body.password);

            var newUser = {
                email: req.body.email,
                password: passwordData.passwordHash,
                salt: passwordData.salt,
                role: req.body.role,
                fullname: req.body.fullname

            }
            var user = new User(newUser);


            user.save(function (err, result) {
                if (err) {
                    res.status(500).send({ message: err.message });
                }
                res.status(200).send({ token: createToken(result),success:true });

            })

        })



    },

    logout: function (req, res) {

        res.status(200).send("logged Out");
    },

    login: function (req, res) {
     



        // find the user
        User.findOne({
            email: req.body.params.email
        }, function (err, user) {

            if (err) throw err;

            if (!user) {
                res.json({ success: false, message: 'Authentication failed. User not found.' });
            } else if (user) {

                var passwordData = sha512(req.body.params.password, user.salt);


                // check if password matches
                if (user.password != passwordData.passwordHash) {
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
                        token: token,
                        user: user
                    });
                }

            }

        });
    },
    getById: function (req, res) {


     
        if (!req.params.id) {
            res.status(500).send('ID field is required.')
        }
        else {
            User.find({ _id: req.params.id }).exec(function (err, result) {

                res.send(result);

            });
        }

    },
     validate: function (req, res) {


     User.findOne({
            email: req.body.params.email
        }, function (err, user) {

            if (err) throw err;

            if (!user) {
                res.json({ success: false, message: 'Authentication failed. User not found.' });
            } else if (user) {

                var passwordData = sha512(req.body.params.password, user.salt);


                // check if password matches
                if (user.password != passwordData.passwordHash) {
                    res.json({ success: false, message: 'Authentication failed. Wrong password.' });
                } else {

                    // if user is found and password is right
                    // check users role

                    if(user.role==="admin"){
                        res.json({
                        success: true
                    });
                    }
                    else{
                         res.json({
                        success: false
                    });
                    }
                

                   
                   
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


//generate random string of characters i.e salt

var genRandomString = function (length) {

    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}


function sha512(password, salt) {

    var hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    var value = hash.digest('hex');

    return {
        salt: salt,
        passwordHash: value
    };
}



function saltHashPassword(userpassword) {

    var salt = genRandomString(16);
    var passwordData = sha512(userpassword, salt);


    return {
        salt: salt,
        passwordHash: passwordData.passwordHash
    }

}