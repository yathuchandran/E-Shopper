const Category = require("../model/category");
const Product = require("../model/product"); //mongodb category model
const User = require("../model/userModel");
const Cart = require("../model/cartModel")
const Address = require("../model/addressModel");
const Order = require("../model/orderModel");
const Coupon = require("../model/couponModel");
const Razorpay = require("razorpay");

const { trusted } = require("mongoose");
const mongoose = require('mongoose');
const { log } = require("console");
const product = require("../model/product");




//VIEW CART-------
const viewCart = async (req, res) => {
  console.log("viewCart", 16);
  try {
    const qty = req.body.qty
    console.log("cart count " + qty)
    const userData1 = req.session.user_id;

    console.log(userData1, 20);
    const user = await User.findById(userData1).populate("cart.product_id");

    console.log(user, 23);
    if (!user) {
      throw new Error("User not found");
    }

    const categories = await Category.find();
    const cartData = user.cart;
    console.log(categories, 30);

    console.log(cartData, 32);

    console.log(cartData.length, 34, "cartData");

    // Ensure that cartData is an array and not undefined
    if (!Array.isArray(cartData)) {
      cartData = [];
    }

    const cartItemCount = cartData.length;
    console.log('Cart Item Count:', cartItemCount);


    const subTotal = findSubTotal(cartData);


    res.render("users/cart", { userData1, categories, subTotal, cartData, cartItemCount });

    console.log(subTotal, 46);
    console.log("work aya");

  } catch (error) {
    console.log(error.message);
    res.status(500).send("An error occurred");
  }
};

//ADD TO CART----------


const addToCart = async (req, res) => {
  try {
    if (req.session.user_id) {
      const userData1 = req.session.user_id;
      const categories = await Category.find();
      const productIds = req.body.productId;

      const quantity = 1;
      const productData = await Product.findById(productIds);

      const user = await User.findById(userData1);

      const existingCartItem = user.cart.find((item) => item.product_id == productIds);

      if (existingCartItem) {
        // If the product is already in the cart, increment the quantity.
        existingCartItem.quantity += quantity;
      } else {
        // If the product is not in the cart, add it to the cart.
        user.cart.push({ product_id: productIds, quantity: quantity });
      }

      const updatedUser = await user.save();
      req.session.user = updatedUser;

      return res.json({
        result: "success"
      });
    } else {
      return res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      error: "An error occurred"
    });
  }
};





//FIND SUB TOTAL FUNCTION-----

//global function to find cart subtotal
function findSubTotal(cartData) {
  let subTotal = 0; // Initialize the sum of products to 0


  // Loop through each item in the shopping cart and add its price * quantity to the sum
  for (let i = 0; i < cartData.length; i++) {
    subTotal += cartData[i].product_id.price * cartData[i].quantity;
  }
  return subTotal;
}



//CART OPERATIONS-----------------



const cartOperation = async (req, res) => {
  try {
    const userData1 = req.session.user_id;
    const a = req.body;
    const data = await User.find(
      { _id: userData1 },
      { _id: 0, cart: 1 }
    ).lean();
    data[0].cart.forEach((val, i) => {
      val.quantity = req.body.datas[i].quantity;
    });
    console.log('count product', 132 + req.body.datas[i].quantity)

    await User.updateOne(
      { _id: userData1._id },
      { $set: { cart: data[0].cart } }
    );

    res.json("from backend ,cartUpdation json");
  } catch (error) {
    console.log(error.message);
  }
};


const cartUpdation = async (req, res) => {

  try {
    const userId = req.session.user_id;
    const productIndex = Number(req.query.index);
    const quantity = req.body.quantity;
    
    console.log("haaaaii",163);

    if (quantity === "plus") {
      await User.updateOne(
        { _id: userId },
        { $inc: { [`cart.${productIndex}.quantity`]: 1 } }
       
      );
    } else if (quantity === "minus") {
      await User.updateOne(
        { _id: userId },
        { $inc: { [`cart.${productIndex}.quantity`]: -1 } }
      );
    }
   
    res.status(200).json({ message: "Cart updated successfully." });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "An error occurred while updating the cart." });
  }
};




//REMOVE FROM CART------------------------
const deleteFromCart = async (req, res) => {
  try {
    const productId = req.query.id;

    const userData1 = req.session.user_id;

    const addressData = await User.findOneAndUpdate(
      { _id: userData1 },
      { $pull: { cart: { product_id: req.body.addressId } } },
      { new: true }
    );


    res.json({
      res: "success"

    });
  } catch (error) {
    console.log(error.message);
  }
};


const couponCheck = async (req, res) => {
  try {
    const userData1 = req.session.user_id;
    let coupon = req.query.couponval.trim();
    let total = req.query.total.trim(); // Assign a value to the total variable

    const couponData = await Coupon.findOne({ code: coupon });

    if (!couponData || couponData.length === 0) {
      res.json({ message: `Invalid coupon` });
    } else if (couponData.status === "inactive") {

      res.json({ message: `Inactive coupon` });
    } else if (parseFloat(total) < couponData.minBill) { // Convert total to a number before comparing

      res.json({ message: `Minimum bill amount is Rs ${couponData.minBill}` });
    } else if (couponData.userid.includes(userData1._id)) {

      res.json({ message: `Coupon already used` });
    } else {
      const discount = couponData.discount;
      const newTotal = parseFloat(total) - discount; // Calculate the new total as a number
      couponData.userid.push(userData1._id);
      await couponData.save();

      res.json({
        message: "Coupon applied successfully",
        discount,
        newTotal,
        success: true,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};






//LOAD CHECKOUT
const loadCheckout = async (req, res) => {
  try {

    const userData1 = req.session.user_id;
    const user = await User.findOne({ _id: userData1 }).populate(
      "cart.product_id"
    );
    const cartData = user.cart;
    const categories = await Category.find();

    subTotal = findSubTotal(cartData);

    const address = await Address.find({ owner: userData1 });


    const addressData = address;

    res.render("users/checkout", {
      userData1,
      cartData: cartData,
      subTotal,
      addressData: addressData,
      categories,
    });
  } catch (error) {
    console.log(error.message);
  }
};




//PLACE ORDER//-------------------------------------------------------------------------------------------


// const placeOrder = async (req, res) => {

//   console.log("cart-placeOrder",214);

//   try {
//     const userData1 = req.session.user_id;

//     const user = await User.findOne({ _id: userData1 }).populate(
//       "cart.product_id"
//     ); //populating User model's cart array with product_id
//     const cartData = user.cart; //check in model

//     const paymentMethod = req.body.pay;

//     console.log(paymentMethod,226,"payementmethod");

//     const shippingAddress = await Address.findOne({ _id: req.body.address1 });

//     console.log(req.body.address1,230);

//     const cartItems = cartData.map((item) => ({
//       product_id: item.product_id,
//       quantity: item.quantity
//     }));



//      //TOTAL AFTER DISCOUNT
//     let finalTotal;
//     if (req.body.totalAfterDiscount) {
//       finalTotal = subTotal - req.body.totalAfterDiscount;
//     } else {
//       finalTotal = subTotal;
//     }



//     if (paymentMethod == "cashondelivery") {
//       if (cartData.length > 0) {
//         const order = new Order({
//           owner: userData1,
//           items: cartItems,
//           shippingAddress: req.body.address1,
//           totalBill: finalTotal,
//           status: req.body.status,
//           paymentMode: paymentMethod,
//           dateOrdered: req.body.dateOrdered,

//           discountAmt:req.body.totalAfterDiscount,
//           coupon:req.body.search

//         });

//         await order.save();
//         user.cart = []; //emptying the cart
//         await user.save();

//       //   res.render("users/ordersuccess", { userData: req.session.user_id });
//       // } else {
//       //   res.redirect("/shop");
//       // }
//       res.status(200).json({ message: 'Order placed successfully.' });
//     } else {
//       res.status(400).json({ message: 'No items in the cart.' });
//     }
//     } else {
//       if (cartData.length > 0) {
//         const order = new Order({
//           owner: userData1._id,
//           items: cartItems,
//           shippingAddress: req.body.address1,
//           totalBill: finalTotal,
//           status: req.body.status,
//           paymentMode: "razorpay",
//           dateOrdered: req.body.dateOrdered,


//           discountAmt:req.body.totalAfterDiscount,
//           coupon:req.body.search
//         });


//         await order.save();
//         user.cart = []; //emptying the cart
//         const orderid = order._id; //check
//         await user.save();

//     //     res.render("users/razorpaypreview", {
//     //       userData1,
//     //       totalbill: finalTotal,
//     //       cartData,
//     //       orderId: orderid,
//     //     });
//     //   } else {
//     //     res.redirect("/shop");
//     //   }
//     // }
//     res.status(200).json({ message: 'Order placed successfully.' });
//   } else {
//     res.status(400).json({ message: 'No items in the cart.' });
//   }
// }
//   } catch (error) {
//     console.log(error.message);
//     res.status(500).json({ message: 'An error occurred while placing the order.' });

//   }
// };


const placeOrder = async (req, res) => {
  try {
    const userData1 = req.session.user_id;
    const user = await User.findOne({ _id: userData1 }).populate(
      "cart.product_id"
    );
    const cartData = user.cart;
    const paymentMethod = req.body.payment;


    await Address.findOne({ _id: userData1 });


    const wallet = user.wallet;

    const cartItems = cartData.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
    }));


    let finalTotal;
    if (req.body.totalAfterDiscount) {
      finalTotal = subTotal - req.body.totalAfterDiscount;
    } else {
      finalTotal = subTotal;
    }

    if (paymentMethod === "cashondelivery") {
      if (cartData.length > 0) {
        const order = new Order({
          owner: userData1,
          items: cartItems,
          shippingAddress: req.body.address,
          totalBill: finalTotal,
          status: req.body.status,
          paymentMode: paymentMethod,
          dateOrdered: req.body.dateOrdered,
          discountAmt: req.body.totalAfterDiscount,
          coupon: req.body.search,
        });
        await order.save();
        user.cart = [];
        await user.save();
        res.json({ codSuccess: true })
      } else {
        res.redirect("/shop");
      }
    } else if (paymentMethod === "razorpay") {
      if (cartData.length > 0) {
        const order = new Order({
          owner: userData1,
          items: cartItems,
          shippingAddress: req.body.address,
          totalBill: finalTotal,
          status: req.body.status,
          paymentMode: paymentMethod,
          dateOrdered: req.body.dateOrdered,
          discountAmt: req.body.totalAfterDiscount,
          coupon: req.body.search,
        });
        await order.save();
        user.cart = [];
        const orderid = order._id;
        await user.save();

        res.json({ razorpay: true, order: order, bill: finalTotal })
      } else {
        res.redirect("/shop");
      }
    } else if (paymentMethod === "wallet") {

      if (cartData.length > 0) {
        // if (wallet >= finalTotal) {
        const order = new Order({
          owner: userData1,
          items: cartItems,
          shippingAddress: req.body.address,
          totalBill: finalTotal,
          status: req.body.status,
          paymentMode: paymentMethod,
          dateOrdered: req.body.dateOrdered,
          discountAmt: req.body.totalAfterDiscount,
          coupon: req.body.search,
        });

        console.log(order, "456"); // Move the console.log here

        await order.save();

      
        // Deduct the amount from the user's wallet
        user.wallet -= finalTotal;
        await user.save();

        console.log(user.wallet,"user.wallet",467);
        user.cart = [];
        await user.save();

        console.log(user.cart,"user.cart",471)

        res.json({ codeSuccess: true })
        //res.json({ wallet: true, order, bill: finalTotal });
       
      } else {
        res.redirect("/shop");
      }
    }

  } catch (error) {
    console.log(error.message);
  }
};



//PAYMENT

const orderPayment = async (req, res) => {
  try {
    const userData1 = req.session.user_id;
    const instance = new Razorpay({
      key_id: "rzp_test_CG1276bWZLDoFW",
      key_secret: "a1VkVxK7Mfz1rh3s3U13D2wt",
    });

    const { amount } = req.body; // Check if this value is being received correctly
    let options = {
      amount: amount, // Amount in the smallest currency unit (req.body.amount)
      currency: "INR",
      receipt: "rcp1",
    };
    instance.orders.create(options, function (err, order) {
      if (err) {
        console.log(err.message);
        return res.status(500).json({ error: "Failed to create order" });
      }

      res.send({ orderId: order.id }); // Extract the id value and send it to checkout
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};




//PAYMENT VERIFY

const paymentverify = async (req, res) => {
  let body =
    req.body.response.razorpay_order_id +
    "|" +
    req.body.response.razorpay_payment_id;

  let crypto = require("crypto");
  let expectedSignature = crypto
    .createHmac("sha256", "a1VkVxK7Mfz1rh3s3U13D2wt")
    .update(body.toString())
    .digest("hex");
  let response = { signatureIsValid: "false" };
  if (expectedSignature === req.body.response.razorpay_signature)
    response = { signatureIsValid: "true" };
  res.send(response);
};



//ORDER SUCCESS
const loadOrderSuccess = async (req, res) => {
  try {
    const shippingAddress = req.body.address1

    console.log(shippingAddress, 466, "shippingAddress");
    const userData1 = req.session.user_id;
    res.render("users/ordersuccess", { userData1 });
  } catch (error) {
    console.log(error.message);
  }
};








const loadWishlist = async (req, res) => {
  try {

    const userData = req.session.user_id;
    const userId = userData
    const categoryData = await Category.findOne({ is_blocked: false })

    const user = await User.findById(userId).populate('wishlist.product_id')
    const wishlistItems = user.wishlist

    const userCart = await User.findOne({ _id: userId }).populate("cart.product_id").lean();
    const cart = userCart.cart;

    if (wishlistItems.length === 0) {

      res.render('users/emptyWishlist', { userData, categoryData })

    } else {

      res.render('users/wishlist', { userData, categoryData, cart, wishlistItems })

    }

  } catch (error) {
    console.log(error.message);
  }
}





const addToWishlist = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const { productId, cartId } = req.body;

    const user = await User.findOne({ _id: userId });


    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const existItem = user.wishlist.includes({ product_id: productId });

    if (!existItem) {
      user.wishlist.push({ product_id: productId });
      await user.save();


      await Product.updateOne({ _id: productId }, { isWishlisted: true });
      await Product.findOneAndUpdate({ _id: productId }, { $set: { isOnCart: false } });

      res.status(200).json({
        message: "Added to wishlist"
      });
    } else {
      res.status(200).json({
        message: "Already exists in the wishlist"
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: "Server error"
    });
  }
};


const addToCartFromWishlist = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.session.user_id;

    const user = await User.findOne({ _id: userId });
    const product = await Product.findById(productId);

    console.log(product, 585);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const isProductInCart = user.cart.some(
      (item) => item.product_id && item.product_id.toString() === productId
    );

    if (isProductInCart) {
      return res.status(200).json({ message: 'Product is already in the cart' });
    }

    user.cart.push({ product_id: product._id, quantity: 1 });
    user.wishlist = user.wishlist.filter(
      (item) => item.product_id && item.product_id.toString() !== productId
    );

    await user.save();

    return res.status(200).json({ message: 'Moved to cart from wishlist' });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ error: 'Server error' });
  }
};







const removeWishlist = async (req, res) => {

  try {

    const userId = req.session.user_id
    const productId = req.params.id

    const user = await User.findById(userId)
    const itemIndex = user.wishlist.indexOf(productId)

    if (itemIndex >= -1) {


      user.wishlist.splice(itemIndex, 1);
      await user.save();


      await User.updateOne({ _id: userId }, { $pull: { wishlist: productId } })
      await Product.updateOne({ _id: productId }, { isWishlisted: false })

      res.status(200).json({
        message: "success",
      });
    } else {
      res.status(404).json({
        message: "Product not found in the wishlist.",
      })
    }

  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
}









module.exports = {
  viewCart,
  addToCart,
  cartOperation,
  deleteFromCart,
  loadCheckout,
  placeOrder,
  couponCheck,
  orderPayment,
  paymentverify,
  loadOrderSuccess,

  loadWishlist,
  addToWishlist,
  addToCartFromWishlist,
  removeWishlist,
  cartUpdation


}