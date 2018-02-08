var mongoose=require('mongoose');

module.exports=mongoose.model('User',{
    email:String,
    password:String,
    salt:String,
    role:String,
    fullname:String
});