// set up mongoose schema 
var mongoose=require('mongoose');
var Schema=mongoose.Schema;

module.exports=mongoose.model('Void', {
    products:[],
    total:Number,
    total_tax:Number,
    payment:Number,
    date:{
        type:Date
    },
    orderNo:Number,
    saleBy:String
});
