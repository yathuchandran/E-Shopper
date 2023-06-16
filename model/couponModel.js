const mongoose=require('mongoose')

//schema of model
const couponSchema=new mongoose.Schema({

    code:{
        type:String,
        required:true
    },
      discount: { 
        type: Number, 
        required: true 
    },
    expiryDate:{
        type:String,
        required:true
    },
    minBill:{
      type:Number,
      required:true
    },
    status:{
      type:String,
      enum: ["active", "inactive"],
      required:true,
    },
    userid:{
      type: [mongoose.Schema.Types.ObjectId],
      default:[]
    }

});

module.exports=mongoose.model('Coupon',couponSchema) //can be used anywhere in the project 