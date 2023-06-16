const Admin = require("../model/adminModel");
const User =require("../model/userModel")
const Order = require("../model/orderModel");
const Coupon = require("../model/couponModel");
const PDFDocument = require("pdfkit");
const banner = require("../model/bannerModel");



const { findByIdAndUpdate } = require("../model/adminModel");
//const moment = require("moment");
//const PDFDocument = require("pdfkit");


//const nodemailer = require("nodemailer");
//const config = require("../config/config")
//const bcrypt = require('bcrypt');
//const randomstring = require('randomstring')




const loadLogin = async (req, res) => {
    try {

        res.render("admin/login")

    } catch (error) {
        console.log(error.message);
    }
}


const verifyLogin = async (req, res) => {
    try {
    const email = req.body.email;
    const password = req.body.password;
    if(email!=""&&password!=""){
        const adminData = await Admin.findOne({ email: email })
        console.log(adminData, 38);
        if (adminData) {
            req.session.user_id = adminData._id;
            req.session.admin=true;
            res.redirect("admin/dashboard")
        } else {
            req.session.admin=false;

            res.render('admin/login', { message: "Email and password is incorrect" });
        }
    }
    } catch (error) {
        console.log(error.message);
    }
}


const loadDashboard = async (req, res) => {
    try {
      if (req.session.user_id) {
        res.render("admin/dashboard");
      } else {
        res.redirect("admin/login"); // Redirect to the login page if not authenticated
      }
    } catch (error) {
      console.log(error.message);
    }
  };

const logout = async (req, res) => {
    try {

        
        req.session.admin=false;
        req.session.destroy()
        res.redirect('/admin')
    } catch (error) {
        console.log(error.message);
    }
}



//DOWNLOAD INVOICE
const invoiceeDownload = async (req, res) => {
  try {
    const id = req.query.id;
    const order = await Order.findOne({ _id: id })
      .populate("items.product_id")
      .populate("shippingAddress");

    if (!order) {
      return res.status(404).send("Order not found");
    }

    // Create a new PDF document
    const doc = new PDFDocument({ font: "Helvetica" });

    // Set the response headers for downloading the PDF file
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="invoice-${order._id}.pdf"`
    );

    // Pipe the PDF document to the response
    doc.pipe(res);

    // Add the order details to the PDF document
    doc
      .fontSize(18)
      .text(`E-SHOPPER INVOICE`, { align: "center", lineGap: 20 }); // increase line gap for better spacing

    doc.moveDown(2); // move down by 2 lines

    doc
      .fontSize(10)
      .text(`Order ID: ${order._id}`, { align: "left", lineGap: 10 }); // decrease line gap for tighter spacing
    doc.moveDown();
    doc.fontSize(12).text("Product Name", { width: 380, continued: true });
    doc
      .fontSize(12)
      .text("Price", { width: 100, align: "center", continued: true });
    doc.fontSize(12).text("Qty", { width: 50, align: "right" });
    doc.moveDown();

    let totalPrice = 0;
    order.items.forEach((item, index) => {
      doc
        .fontSize(12)
        .text(`${index + 1}. ${item.product_id.name}`, {
          width: 375,
          continued: true,
        });

      const totalCost = item.product_id.price * item.quantity;
      doc
        .fontSize(12)
        .text(`${totalCost}`, { width: 100, align: "center", continued: true });

      doc.fontSize(12).text(`${item.quantity}`, { width: 50, align: "right" });
      doc.moveDown();
      totalPrice += totalCost;
    });

    doc.moveDown(2); // move down by 2 lines

    doc.fontSize(12).text(`Subtotal: Rs ${totalPrice}`, { align: "right" });
    doc.moveDown();
    doc
      .fontSize(12)
      .text(`Total Amount after discount: Rs ${order.totalBill}`, {
        align: "right",
      });
    doc.moveDown();
    doc.fontSize(12).text(
      `Ordered Date: ${order.dateOrdered.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })} ${order.dateOrdered.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
      })}`,
      { lineGap: 10 } // increase line gap for better spacing
    );
    doc.moveDown();
    doc
      .fontSize(12)
      .text(`Payment Method: ${order.paymentMode}`, { lineGap: 10 });
    doc.moveDown();
    doc.fontSize(12).text(`Coupon : ${order.coupon}`, { lineGap: 10 });
    doc.moveDown();
    doc
      .fontSize(12)
      .text(`Discount Amount : ${order.discountAmt}`, { lineGap: 10 });
    doc.moveDown();
    doc
      .fontSize(12)
      .text(
        `Shipping Address:\n ${order.shippingAddress.name},\n${order.shippingAddress.mobile},\n${order.shippingAddress.address1},\n${order.shippingAddress.address2},\n${order.shippingAddress.city}`,
        { lineGap: 10 }
      );
    doc.moveDown();
    doc.fontSize(12).text(`Order Status: ${order.status}`, { lineGap: 10 });

    doc.moveDown(2); // move down by 2 lines

    doc
      .fontSize(14)
      .text("Thank you for purchasing with us!", {
        align: "center",
        lineGap: 20,
      });

    doc.moveDown(); // move down by 1 line

    // End the PDF document
    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};


// const admiDashboard = async (req, res) => {
//     try {

//         const adminData = await Admin.find({ is_admin: 0 });
       
//         res.render('admin/dashboard', { users: adminData });
//     } catch (error) {
//         console.log(error.message);
//     }
// }


const usersList = async(req, res) => {
    try {

        const userData =await User.find()
        if (userData) {
            res.render('admin/users',{users:userData});
        } else {
            res.redirect('admin/dashboard');
        }
        
    } catch (error) {
        console.log(error.message);
    }
}


// ORDER MANAGEMENT
const orderHistory = async (req, res) => {
    try {
      //const orderData = await Order.find({ owner: userData1._id }).populate('items.product_id').populate('shippingAddress')
      
      const userData1 = req.session.user_id;

      const orderData = await Order.find()
        .populate("items.product_id")
        .populate("shippingAddress")
        .sort({ dateOrdered: -1 });

        console.log(orderData);
  
      res.render("admin/order", { order: orderData });
    } catch (error) {
      console.log(error.message);
    }
  };






  
  //ADMIN
  const orderHistoryInside = async (req, res) => {
    try {
      const id = req.query.id;
      const orderDetail = await Order.findById(id)
        .populate("items.product_id")
        .populate("shippingAddress");
  
      res.render("admin/orderdetails", { orderDetail });
    } catch (error) {
      console.log(error.message);
    }
  };
  
  //ORDER STATUS CHANGE FOR ADMIN
  const orderHistoryStatusChange = async (req, res) => {
    try {
      const orderId = req.body.id;
      const newStatus = req.body.status_change;
      await Order.findByIdAndUpdate(
        orderId,
        { $set: { status: newStatus } },
        { new: true }
      );
      res.redirect("back"); // used to redirect the user back to the previous page after the update is complete.
    } catch (error) {
      console.log(error.message);
    }
  };
  




const blockUser=async(req,res)=>{
   
    
    try {
        const blockid=req.query.id;
    const blockUserData = await User.findById(blockid);

    const block_status = blockUserData.is_blocked;

       await User.findByIdAndUpdate(
        blockid,
        {$set:{is_blocked: !block_status}},
        {new:true}
       );
       res.redirect("/admin/users");
    } catch (error) {
        console.log(error.message);
    }
}


  

//LOAD ADD COUPON
const loadAddCoupon = async (req, res) => {
  try {
    // const couponData = await Coupon.find();
    res.render("admin/addcoupon");
  } catch (error) {
    console.log(error.message);
  }
};

//ADD COUPON
const addCoupon = async (req, res) => {
  try {

    const name = req.body.code;

    const nameLo = name.toLowerCase();
    const couponData = await Coupon.findOne({ code: nameLo });

    if (
      Object.values(req.body).some(
        (value) => !value.trim() || value.trim().length === 0
      )
    ) {
      res.render("admin/addcoupon", { message: "please fill the field" });
    }

 
    if (couponData) {
      res.render("admin/addcoupon", { message: "Coupon exists" });
    }else{

       const inputDate = req.body.expiryDate; // assuming input is in yyyy-mm-dd hh:mm:ss format

      const coupon = new Coupon({
        code: req.body.code,
        discount: req.body.discount,
        expiryDate: inputDate,
        minBill: req.body.minBill,
        status: req.body.status,
      });
      await coupon.save();
      res.redirect("/admin/coupon");
    } 
  
  } catch (error) {
    console.log(error.message);
  }
};



//LIST COUPON
const couponList = async (req, res) => {
  try {
    const couponData = await Coupon.find();
    res.render("admin/coupon", { couponData });
  } catch (error) {
    console.log(error.message);
  }
};


const loadBanner = async (req, res) => {

  try {
      const bannerData = await banner.find({})
      console.log();
      res.render('admin/banner', { banner: bannerData });
  } catch (error) {
      console.log(error);
  }
}



const loadaddBanner = async (req, res) => {

  try {
      res.render('admin/add-banner');
  } catch (error) {
      console.log(error);
  }
}

const insertBanner = async (req, res) => {

  try {
    const images = req.files.map((file) => {
      return file.filename;
    });
      const Banner = new banner({

          name: req.body.name,
          image:images
      });

      const bannerData = await Banner.save();
      res.redirect('/admin/banner');
  } catch (error) {
      console.log(error);
  }
}


const deleteBanner = async (req, res) => {
try {

  const banners = req.body.banner
  const deletebanner = await banner.findByIdAndDelete({_id:banners})

  if (deletebanner) {
    res.json('success')
  }

} catch (error) {
  console.log(error.message);
}
}


module.exports = {
    loadLogin,
    verifyLogin,
    loadDashboard,
    logout,
    //admiDashboard,
    invoiceeDownload,
    usersList,
    blockUser,

    orderHistory,
    orderHistoryInside,
    orderHistoryStatusChange,
    
    loadAddCoupon,
    addCoupon,
    couponList,

    loadBanner,
    loadaddBanner,
    insertBanner,
    deleteBanner,
}