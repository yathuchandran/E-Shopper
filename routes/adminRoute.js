
const express = require("express");
const admin_route = express.Router();
const adminAuth = require("../middleware/adminAuth");


const session = require("express-session");
const config = require("../config/config");
admin_route.use(session({ secret: config.sessionSecret }));

const adminController = require("../controllers/adminController");
const productController = require("../controllers/productController")
const categoryController = require("../controllers/categoryController")
//const { listCategory } = require('../controllers/categoryController');
const dashboardController=require('../controllers/dashboardController');


const store = require("../middleware/multer");



admin_route.get('/', adminController.loadLogin);
admin_route.post('/', adminController.verifyLogin);
admin_route.get('/dashboard', dashboardController.homeload);

admin_route.get('/logout', adminController.logout);
//admin_route.get('/dashboard', adminController.admiDashboard);
admin_route.get('/users', adminController.usersList)


admin_route.get('/salesreport', adminAuth.isLogin,dashboardController.reports)

admin_route.post('/getOrders', adminAuth.isLogin,dashboardController.getOrders)
 admin_route.get('/excelDownload', adminAuth.isLogin,dashboardController.excelDownload)
 admin_route.get('/downloadinvoicee', adminAuth.isLogin, adminController.invoiceeDownload);


admin_route.post('/users/block', adminController.blockUser);


//Define the route for listing categories
admin_route.get('/category', adminAuth.isLogin, categoryController.listCategory);
admin_route.get('/addcategory',adminAuth.isLogin, categoryController.loadAddCategory);
admin_route.post('/addcategory',adminAuth.isLogin,store.store.single('image'),categoryController.insertCategory)
admin_route.get('/editcategory',adminAuth.isLogin,categoryController.loadEditCategory)
admin_route.post('/editcategory',adminAuth.isLogin,store.store.single('image'), categoryController.updateCategoy)
admin_route.get('/deletecategory',adminAuth.isLogin,categoryController.deleteCategory)



admin_route.get('/order', adminAuth.isLogin,adminController.orderHistory)
admin_route.get('/orderdetails', adminAuth.isLogin,adminController.orderHistoryInside)
admin_route.post('/orderdetails', adminAuth.isLogin,adminController.orderHistoryStatusChange)





admin_route.get('/product', adminAuth.isLogin, productController.listProduct)
admin_route.get('/addProduct',adminAuth.isLogin, productController.productLoad);

admin_route.post('/addProduct', adminAuth.isLogin, store.store.array('image',4),  productController.addProduct)
admin_route.get('/editproduct', adminAuth.isLogin, productController.loadEditProduct);
admin_route.post('/editproduct',adminAuth.isLogin, store.store.array('image',8), productController.editProduct)
admin_route.get('/blockproduct/:id',adminAuth.isLogin,productController.blockProduct);
admin_route.delete('/proimdelete',adminAuth.isLogin,productController.deleteProdImage)




admin_route.get('/addcoupon',  adminAuth.isLogin,adminController.loadAddCoupon)
admin_route.post('/addcoupon', adminAuth.isLogin,adminController.addCoupon)
admin_route.get('/coupon',     adminAuth.isLogin,adminController.couponList)


//BANNER---
admin_route.get('/banner',     adminAuth.isLogin,adminController.loadBanner)
admin_route.get('/add-banner',     adminAuth.isLogin,adminController.loadaddBanner)
admin_route.post('/add-banner',     adminAuth.isLogin, store.store.array("image",1),adminController.insertBanner)
admin_route.post('/removebanner',     adminAuth.isLogin,adminController.deleteBanner)




module.exports = admin_route;

