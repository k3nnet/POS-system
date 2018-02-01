
var User = require('../models/user');
var crypto=require('crypto');

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

            var passwordData=saltHashPassword(req.body.password);

            var newUser={
                email:req.body.email,
                password:passwordData.passwordHash,
                salt:passwordData.salt
            }
            var user = new User(newUser);


            user.save(function (err, result) {
                if (err) {
                    res.status(500).send({ message: err.message });
                }
                res.status(200).send({ token: createToken(result) });

            })

        })



    },

    logout:function(req,res){
        
        res.status(200).send("logged Out");
    },

    login: function (req, res) {
      console.log(req.body.params);

      saltHashPassword('MYPASSWORD');
       saltHashPassword('MYPASSWORD');

        // find the user
        User.findOne({
            email: req.body.params.email
        }, function (err, user) {

            if (err) throw err;

            if (!user) {
                res.json({ success: false, message: 'Authentication failed. User not found.' });
            } else if (user) {

                 console.log(user);
                var passwordData=sha512(req.body.params.password,user.salt);

                console.log("userHash= "+user.password);
                console.log("databapassword= "+passwordData.passwordHash);

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


//generate random string of characters i.e salt

var genRandomString=function(length){

	return crypto.randomBytes(Math.ceil(length/2)).toString('hex').slice(0,length);
}


function sha512(password,salt){

	var hash=crypto.createHmac('sha512',salt);
	hash.update(password);
	var value=hash.digest('hex');

	return{
		salt:salt,
		passwordHash:value
	};
}



function saltHashPassword(userpassword){

	var salt=genRandomString(16);
	var passwordData=sha512(userpassword,salt);
  // console.log("userpassword="+userpassword);
//	console.log('passwordHash='+passwordData.passwordHash);
//	console.log('nsalt='+passwordData.salt);

    return {
        salt:salt,
        passwordHash:passwordData.passwordHash
    }
	
}