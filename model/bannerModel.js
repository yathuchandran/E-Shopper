const mongoose = require("mongoose");

 const bannerSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    image:{
        type:Array,
    }
 })

 module.exports=mongoose.model('Banner',bannerSchema)