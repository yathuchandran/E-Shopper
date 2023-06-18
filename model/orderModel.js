const mongoose = require("mongoose");

//schema of order model
const orderSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  items: [
    //as user can order multiple products
    {
      product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product", // Updated to "Product" with uppercase
        //use same name as in product model collection name last
      },
      quantity: {
        type: Number,
      },
      price: {
        type: Number,
        require:false
      },
    },
  ],
  shippingAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address", // Make sure the reference matches the model name for the address
  },

  totalBill: {
    type: Number,
  },
  status: {
    type: String,
    enum: ["ordered", "shipped", "delivered"],
    default: "ordered",
  },
  paymentMode: {
    type: String,
    enum: ["cashondelivery", "razorpay", "wallet","pending"],
    default: "pending",
  },
  dateOrdered: {
    type: Date,
    default: Date.now,
  },
  discountAmt: {
    type: Number,
  },
  coupon: {
    type: String,
  },
  wallet: {
    type: Number,
  },
  
});

module.exports = mongoose.model("order", orderSchema); //can be used anywhere in the project




