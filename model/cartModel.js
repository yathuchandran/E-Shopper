const mongoose = require('mongoose');//schema of model

const cartSchema=new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    productId:{          //
        type:String,
    },
    productName: {        //
        type: String
    },
    quantity: {         //
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    price: {          //
        type: Number
    },
    category: {
        // type: String,
        // required: true
        type: mongoose.Schema.Types.ObjectId,
        ref:'Category',
        required:true
    },
    // stock:{
    //     type:Number
    // },
    // image:{
    //     type:Array,
    // },
    size:{
        type:Number,
        required:true
    },
    //   bill: {
    // type: Number,
    // default: 0
    // },
    // orderStatus: {
    // type: String,
    // }

});

module.exports=mongoose.model('Cart',cartSchema) //can be used anywhere in the project 







