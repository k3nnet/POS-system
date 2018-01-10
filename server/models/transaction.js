// set up mongoose schema 
var mongoose=require('mongoose');
var Schema=mongoose.Schema;

module.exports=mongoose.model('Transaction', {
    products:[],
    total:Number,
    total_tax:Number,
    payment:Number,
    date:{
        type:Date
    }
});
