console.log(111111111111111111111111111111);

const express = require ("express") 
const user_route = express.Router();
const productController = require("../controllers/productController")

const session = require("express-session")
// const config =require("../config/config")
const auth =require("../middleware/auth")
const userController = require ("../controllers/userController");
// const Product = require("../model/product");
const cartController=require("../controllers/carController")

user_route.use(session({secret: "mysecret",resave: false,saveUninitialized: false }));// or true, depending on your needs


//REGISTRATION------
user_route.get('/register',userController.loadRegister);
user_route.post('/register',userController.insertUser);
user_route.get('/verify',userController.verifyMail);

user_route.get('/otpverification', userController.loadverifyotp)
user_route.post('/otpverification',userController.verifyotp)


//genaral-----------

user_route.get('/',auth.isLogin,userController.loadHome)
user_route.get('/home',userController.loadHome)
user_route.get('/shop',userController.loadShop)
user_route.get('/productdetail',userController.loadCategoryProducts)
user_route.get('/productdetails',userController.loadDeatails)
user_route.post('/productdetails',cartController.addToCart)



//LOGIN------------------
user_route.get('/login',userController.loginLoad);
user_route.post('/login',userController.verifyLogin);
user_route.get('/logout',auth.isLogin,userController.userLogout);
user_route.post('/interconnect',userController.interConnect)
//user_route.post('/searchproduct',userController.search)
user_route.post('/sort',userController.sort)



//USERS------------------
user_route.get("/profile", auth.isLogout,   userController.loadProfile);
user_route.get("/editprofile", auth.isLogout, userController.loadEditProfile);
user_route.post("/editprofile",auth.isLogout,  userController.editProfile);


//ADDRESS-------
user_route.get("/address", auth.isLogout,  userController.loadAddress);
user_route.get("/addaddress", auth.isLogout, userController.loadAddAddress);
user_route.post("/addaddress", auth.isLogout, userController.addAddress);

user_route.get("/editaddress", auth.isLogout,  userController.loadEditAddress);
user_route.post("/editaddress",auth.isLogout,  userController.editAddress);
user_route.get('/deleteaddress',auth.isLogout,  userController.deleteAddress)



//ORDERS---------------------------------------

user_route.get("/cart",auth.isLogout,cartController.viewCart)
user_route.post("/cart-operation",auth.isLogout,  cartController.cartOperation)
user_route.post("/deleteproduct",auth.isLogout,  cartController.deleteFromCart)
user_route.get("/checkout", auth.isLogout,  cartController.loadCheckout);

user_route.post('/checkout',auth.isLogout,cartController.placeOrder)
user_route.get('/ordersuccess', auth.isLogout,  cartController.loadOrderSuccess)
user_route.get("/orderhistory",auth.isLogout,  userController.orderHistory);
user_route.get("/orderhistorydetails", auth.isLogout,  userController.orderHistoryDetails);
user_route.post("/ordercancel",auth.isLogout, userController.orderCancel)
user_route.post("/orderreturn",auth.isLogout,userController.orderReturn)



user_route.get('/coupon',auth.isLogout, cartController.couponCheck)

user_route.post('/create/orderId', auth.isLogout, cartController.orderPayment)
user_route.post('/api/payment/verify', auth.isLogout, cartController.paymentverify)


user_route.get('/downloadinvoice', auth.isLogout, userController.invoiceDownload);


//WHISHLIST------------------------------------------------------------------------
user_route.get('/wishlist', auth.isLogout,  cartController.loadWishlist)
user_route.post('/addToWishlist', cartController.addToWishlist)
user_route.post('/removeWishlist/:id', cartController.removeWishlist)
user_route.post('/addToCartFromWishlist/:id', cartController.addToCartFromWishlist)


//COUPON----------




//FORGET PASSWORD------------------------
user_route.get('/forget',userController.forgetLoad);
user_route.post('/forget',userController.forgetVerify);
user_route.get('/otpforgotpassword',userController.forgetPasswordOtpLoad)
user_route.post('/forgotpassword',userController.forgetVerifyotp)
user_route.get('/restpassword',auth.isLogout,userController.loadresetpassword)
user_route.post('/restpassword',auth.isLogout,userController.resetpassword)
user_route.get('/forget-password',auth.isLogout,userController.forgetPasswordLoad)
user_route.post('/forget-password',auth.isLogout,userController.resetPassword)

//user_route.get('/orderHistory',auth.isLogout,userController.)

module.exports = user_route;



