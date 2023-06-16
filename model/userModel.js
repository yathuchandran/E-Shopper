const mongoose =require("mongoose")

const userschema =new  mongoose.Schema({
    name :{
    type:String,
    required:true
},
    email:{
        type:String,
        required:true
    },
    mobile:{
        type:String,
        required:true
    },

    password:{
        type:String,
        required:true
    },
    is_admin:{
        type:Boolean,
        required:true
    },
    is_verified:{
        type:Number,
        default:0
    },
    is_blocked:{
        type:Boolean,
        required:true
    },
    token:{
        type:String,
        default:''
    },
    cart:[{
        product_id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Product',  //use same name as in product model collection name last
        },
        quantity:{
            type: Number,
        default: 1
        }
    }],
    wishlist: [{
       product_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product'
       }
      }],
      wallet:{
        type:Number,
        required:false
      }
      
      
    
    

});
module.exports= mongoose.model("User",userschema)