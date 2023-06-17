const mongoose = require("mongoose");


const productSchema = new mongoose.Schema({
  name: {
      type:String,
      required:true,
    },
    description: {
      type:String,
      required:true,
    },
    image: {
      type:Array,
    }, 
    price: {
      type:Number,
      required:true,
    },
    category:{
      type:String,
      required:true
    },
    brand:{
      type:String,
      required:true,
    },
   
    quantity:{
      type:Number,
      required:true,
    },
    is_blocked:{
      type:Boolean,
      required:true
    },
    isWishlisted:{
      type:Boolean,
      required:false
  }
  });
  mongoose.model("Product", productSchema);

 module.exports = mongoose.model("Product");

 
