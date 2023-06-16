const mongoose = require('mongoose');

// Define the schema for the Category model
const categorySchema = new mongoose.Schema({
  name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    is_blocked:{
        type: Boolean,
        default: false
    }
});

// Register the schema with Mongoose and create the Category model
module.exports= mongoose.model('Category',categorySchema);



