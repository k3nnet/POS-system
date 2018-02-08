var mongoose=require('mongoose');

module.exports=mongoose.model('Inventory',{
    barcode:String,
    name:String,
    price:Number,
    products_at_hand:Number,
    food:Boolean
   
});
