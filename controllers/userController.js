const User = require("../model/userModel");
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer")
const config = require("../config/config")
const randomstring = require("randomstring")
const Category = require("../model/category");
const Product = require("../model/product");
const Address = require("../model/addressModel");
const Order = require("../model/orderModel");
const PDFDocument = require("pdfkit");
const banner = require("../model/bannerModel");
const razorpay = require('razorpay')

// const nodemailer = require('nodemailer');

//const moment = require("moment");



let userRegData;
function generateOTP(){
return otp = `${Math.floor(1000 + Math.random() * 90000)}`
}

let resetMail

//for send mail  function-------------------------------------------------------------------------------------------

const sendVerifyMail = async (name, email, res) => {
  console.log("sendVerifyMail to this account of yathesh ");
  try {
    console.log("transporter");
    const transporter = nodemailer.createTransport({
      // host: 'smtp.gmail.com',
      // port: 587,
      // secure: false,
      // requireTLS: true,
      service:'gmail',
      auth: {
        user: "yatheesh.bc8@gmail.com",
        pass: "cslrrwsbkjxphibf"
      }
    });
    const otp = generateOTP(); // Assuming you have a function to generate the OTP
console.log(otp,"otp",45);
    
    const mailOptions = {
      from: "yatheesh.bc8@gmail.com",
      to: email,
      subject: 'Verification Email',
      text: `${otp}`
    }


    const info = await transporter.sendMail(mailOptions);
    console.log(info, 54);
    console.log("Email has been sent:", info.response);
    res.redirect("/otpverification");
    console.log('Mail sent successfully');
    return otp;
   
  } catch (error) {
    console.log("Error while sending email:", error);
    console.log(error.message);
  }
};
const securePassword = async (password) => {
    try {

        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;

    } catch (error) {
        console.log(error.message);
    }
}








//for reset send mail function--------------------------------------------------------------------------
const sendResetPasswordMail = async (name, email, token) => {
    try {


        const transporter = nodemailer.createTransport({
           service:"gmail",
            auth: {
                user:config.emailUser,
                pass:config.emailPassword
            }
        });
        
        const mailoptions = {
            from:config.emailUser,
            to: email,
            subject: 'for Reset Password mail',
            text: `${otp}`
            //html: '<p>hii' + name + ', please click to <a href="http://127.0.0.1:3000/forget-password?token=' + token + '">Reset  </a> your password</p>'

        }
        transporter.sendMail(mailoptions, function (error, info) {
            if (error) {
                console.log("error while sending email:" , error)
            }
            else {
                console.log("Email has been sent:", info.response);
                res.redirect("/otpverification")
            }
            return otp;
        })

    } catch (error) {
        console.log(error.message);
    }
}


// LOAD REGISTERATION---------------------------------------------------------------
const loadRegister = async (req, res) => {
    try {
        res.render('users/registration')
    } catch (error) {
        console.log(error.message);
    }

}

// USER INSERT (ADDING)--------
const insertUser = async (req, res) => {
    try {
      console.log(128);
        const name = req.body.name
        const email = req.body.email
        console.log('name is ',name, 'email is ', email)
        userRegData = req.body
        console.log(132, email);
        const existUser = await User.findOne({ email: email })

        if (existUser == null) {
          console.log('verify email send cheyyunnathinu munne')
            await sendVerifyMail(name, email)
            res.redirect('/otpverification')

        }
        else {
            if (existUser.email == email) {
                res.render('users/registration', { message1: 'User Alredy Exist' })
            }
        }
    }
    catch (error) {
        console.log(error.message)
    }
}


// OTP VERIFICATION IN E-MAIL --------------------------------------------------------------------------------------------------------------
const loadverifyotp = async (req, res) => {

    try {
      console.log(155);
        res.render('users/otpverification')
    } catch (error) {
        console.log(error.message);
    }
}

//OTP VERIFY-------------
const verifyotp = async (req, res) => {
  //.log("yathukhg");
    try {
        //conosle.log(userRegData,'user registrtation data')
        const password = await bcrypt.hash(userRegData.password, 10);
        const enteredotp = req.body.otp;
        // console.log(enteredotp,'entered otp is this')
        // console.log('checking otp page')
        if (otp == enteredotp) {
            const user = new User({
                name: userRegData.name,
                mobile: userRegData.mobile,
                email: userRegData.email,
                password: password,
                is_blocked: false,
                is_verified: 1,
                is_admin: 0
            })
            const userData = await user.save();
            res.render('users/login', { message2: "Registration successful" })
        }
        else {
            res.render('users/otpverification', { message1: "Invalid otp" })
        }
    }
    catch (error) {
        console.log(error.message);
    }
}

const verifyMail = async (req, res) => {
    try {
        const updateInfo = await User.updateOne({ _id: req.query.id }, { $set: { is_verified: 1 } })
        res.render("users/email-verified")
    } catch (error) {
        console.log(error.message);
    }
}




//login user methods start -------------------------------------------------------
const loginLoad = async (req, res) => {
    try {
        if (req.session.user_id) {
            res.redirect('/home')
        } else {
            res.render('users/login')
        }

    } catch (error) {
        console.log(error.message);
    }
}

//VERIFY LOGIN CHECKING---------------
const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({ email: email })
        console.log(userData);
        if (userData) {
            const is_blocked = userData.is_blocked

                if(is_blocked===true){
                    res.render('users/login', { message: "User is already blocked" })
                    }
            req.session.userName = userData.name
            const passwordMatch = await bcrypt.compare(password, userData.password)
            
            if (passwordMatch) {
                if (userData.is_verified === 0) {
                    res.render('users/login', { message: "Please verify your mail" })
                } else {
                    req.session.user_id = userData._id;
                    res.redirect('/home')
                }
            } else {
                res.render('users/login', { message: "Email and password is incorect" })
            }
        } else {
            res.render('users/login', { message: "Email and password is incorect" })
        }

    } catch (error) {
        console.log(error.message);
    }
}

//LOAD HOME------------
const loadHome = async (req, res) => {
    
    try {
        const categoryData=await Category.find()
        const productData=await Product.find()
        const bannerData=await banner.find()

        res.render('users/home', { isLogged: req.session.userName, categoryData,productData,bannerData})

        if (req.session.userName) {
            console.log(req.session.userName,256);
            console.log(req.session.user_id,257);
           
            
            
        }
        else {
            res.render('users/home')
        }
    } catch (error) {
        console.log(error.message);
    }
 }

////////--CATEGORY FILTARATION--//////////////////////////////////////////////////////////////////////////////////

const shopByCategory=async(req,res)=>{
    try {
        const userData1=req.session.user_id
        const categoryId =req.body.id;
        const categories=await Category.find();
        const shopData=await Product.find({
            category:categoryId,
        is_blocked:false,
        });
        res.json({shopData,categories,userData1});
        console.log(json);
    } catch (error) {
        console.log(error.message);
    }
}
 //load all product------------------------------------------------



// const loadShop = async (req, res) => {
//   try {
    
//       const categoryData = await Category.find();
//     const productData = await Product.find();
    
//     let search = '';
//     if (req.query.search) {
//       search = req.query.search;
    
    
//       const shopData = await Product.find({
//         is_blocked: false,
//         $or:[{name :{ $regex: ".*" + search + ".*", $options: "i" } }
//       ]
//       })
      
//       if(shopData){
//         res.render("users/shop", {
//           isLogged: req.session.userName,
//           productData: shopData
//         });
//       }
    
//     }

//     let page = 1;
//     if (req.query.page) {
//       search = req.query.page;
    
//       const limit =10;

//       .limit(limit*1)
//       .skip((page-1)*limit)
//       .exec()

//       const count = await Product.find({
//         is_blocked: false,
//         $or:[{name :{ $regex: ".*" + search + ".*", $options: "i" } }
//       ]
//       }).countDocuments();

//       res.render("users/shop",{
//         isLogged: req.session.userName,
//         totalPages:Math.ceil(count/limit),
//         currentPage:page,
//         previou:page-1
//       })
    
//     // const option = {
//     //   page: req.query.page || 1, // Get current page number from query parameters
//     //   limit: 8
//     // };

//       res.render("users/shop", {
//         isLogged: req.session.userName,
//         productData: productData,
//         categoryData: categoryData,
        
//       });
    
      
      
//   } catch (error) {
//     console.log(error.message);
//   }
// };


const loadShop = async (req, res) => {
  try {
    var cartItemCount
    const categoryData = await Category.find();
    const productData = await Product.find();
    User.findById({_id: req.session.user_id})
  .then(user => {
    if (user) {
       cartItemCount = user.cart.length;
      console.log('Cart Item Count:', cartItemCount);
    }})
    

    let search = '';
    if (req.query.search) {
      search = req.query.search;

      const shopData = await Product.find({
        is_blocked: false,
        name: { $regex: ".*" + search + ".*", $options: "i" }
      });

      if (shopData.length > 0) {
        res.render("users/shop", {
          isLogged: req.session.userName,
          productData: shopData,
          cartItemCount:cartItemCount
        });
        return; // Return early to prevent further execution
      }
    }

    let page = 1; // Default to page 1 if not provided
    if (req.query.page) {
      page = parseInt(req.query.page); // Parse page number to integer
    }
    
    const limit = 9;
    const skip = (page - 1) * limit;
    
    const query = {
      is_blocked: false,
      name: { $regex: new RegExp(search, "i") } // Use RegExp constructor instead of string concatenation
    };
    
    const [shopData, count] = await Promise.all([
      Product.find(query).limit(limit).skip(skip), // Fetch paginated data
      Product.countDocuments(query) // Count total documents matching the query
    ]);
    
    const totalPages = Math.ceil(count / limit);
    
    res.render("users/shop", {
      isLogged: req.session.userName,
      productData: shopData,
      totalPages: totalPages,
      currentPage: page,
      previousPage: page > 1 ? page - 1 : null, // Set previousPage to null for first page
      nextPage: page < totalPages ? page + 1 : null // Set nextPage to null for last page
    });
    

    res.render("users/shop", {
      isLogged: req.session.userName,
      productData: productData,
      categoryData: categoryData
    });
  } catch (error) {
    console.log(error.message);
  }
};


///--CATEGORY NN PRODUCT LIST CHEYYUM--
const loadCategoryProducts = async (req,res)=>{
    try{
        const productId=req.query.id
        const productData=await Product.find({category:productId})
        res.render('users/shop',{isLogged: req.session.userName,productData:productData})

    }catch(error){
        console.log(error.message);
    }
}

//----SINGLE PRODUCT LOAD -----
const loadDeatails=async(req,res)=>{
    try {
        const categories=await Category.find();
        const id=req.query.id
        const userData1=req.session.user_id;
        let productData=await Product.findById(id);
        res.render("users/detail",{isLogged: req.session.userName,productData:productData,userData1,categories })
    } catch (error) {
        console.log(error.message);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//INTERCONNECTING CATEGORY, SEARCH, SORT first linking cat filter and search
const interConnect = async (req, res) => {
    try {
      const catId = req.body.id;
      const shopData = await Product.find({ category: catId, is_blocked: false });
      res.json({ shopData });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: "Server error" });
    }
  };

// const search = async (req, res) => {
//     console.log("user-search",350);
//     try {
//     // Get the search term from the request body.
//     let search ='';
//     search = req.body.searchval.trim();
         
//     console.log("cart search 356 ",    "-",search)
//     // Get the category ID from the request body.
//     const catId = req.body.categoryId

        
//     console.log(catId,359,req.body.categoryId);
//     // If the category ID is present, search for products in that category.
//     if (catId) {
//       const shopData = await Product.find({
//         is_blocked: false,
//         $or: [
//           {
//             category: catId,
//             name: { $regex: ".*" + search + ".*", $options: "i" },
//           },
//         ],
//       });
  
//       // Return the results to the client.
//       res.json({ shopData });
//     } else {
//       // If the category ID is not present, search for all products.
//       const shopData = await Product.find({
//         is_blocked: false,
//         $or: [{ name: { $regex: ".*" + search + ".*", $options: "i" } }],
//       });
  
//       // Return the results to the client.
//       res.json({ shopData });
//     }

//     } catch (error) {
//         console.log(error.message);
//         res.status(500).json({ error: "Server error" });
//     }
//   };


// const search = async (req, res) => {
//   try {
//       const search = req.body.searchval.trim();
//       const catId = req.body.categoryId;


//         console.log(search,400);
//       let query = {
//           is_blocked: false,
//           name: { $regex: ".*" + search + ".*", $options: "i" },
//       };

//       if (catId) {
//         console.log(catId,"cat id ind",407);
//           query.category = catId;
//       }

//       const shopData = await Product.find(query);

//       console.log(shopData,413);

//       res.json({ shopData });
//   } catch (error) {
//       console.log(error.message);
//       res.status(500).json({ error: "Server error" });
//   }
// };



// const search = async (req, res) => {
//   try {
//     const searchVal = req.body.searchval.trim();
//     const catId = req.body.categoryId;

//     let query = {
//       is_blocked: false,
//       name: { $regex: ".*" + searchVal + ".*", $options: "i" },
//     };

//     if (catId) {
//       query.category = catId;
//     }

//     const shopData = await Product.find(query);
//     res.json({ shopData });
//   } catch (error) {
//     console.log(error.message);
//     res.status(500).json({ error: "Server error" });
//   }
// };




  //SORT
const sort = async (req, res) => {
    try {
      const { id, categoryId } = req.body;
      let productData;
      if (id === "aToZ") {
        if (categoryId) {
          productData = await Product.find(
            { category: categoryId },
            { is_blocked: false }
          ).sort({ name: 1 });
        } else {
          productData = await Product.find({ is_blocked: false }).sort({
            name: 1,
          });
        }
      } else if (id === "zToA") {
        if (categoryId) {
          productData = await Product.find(
            { category: categoryId },
            { is_blocked: false }
          ).sort({ name: -1 });
        } else {
          productData = await Product.find({ is_blocked: false }).sort({
            name: -1,
          });
        }
      } else if (id === "price-low-to-high") {
        if (categoryId) {
          productData = await Product.find(
            { category: categoryId },
            { is_blocked: false }
          ).sort({ price: 1 });
        } else {
          productData = await Product.find({ is_blocked: false }).sort({
            price: 1,
          });
        }
      } else if (id === "price-high-to-low") {
        if (categoryId) {
          productData = await Product.find(
            { category: categoryId },
            { is_blocked: false }
          ).sort({ price: -1 });
        } else {
          productData = await Product.find({ is_blocked: false }).sort({
            price: -1,
          });
        }
      } else if (id === "default") {
        productData = await Product.find({ is_blocked: false });
      } else {
        return res.status(400).json({ error: "Invalid sort parameter" });
      }
  
      res.json({ productData });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  };


  

  //DOWNLOAD INVOICE
const invoiceDownload = async (req, res) => {
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
      .text(`E-SHOPPER  INVOICE`, { align: "center", lineGap: 20 }); // increase line gap for better spacing

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





//USER LOG-OUT----------------------------------------
const userLogout = async (req, res) => {
    try {

        req.session.destroy()
        res.redirect('/')

    } catch (error) {
        console.log(error.message);
    }
}




//USER-PROFILE--------------------------------------------------------------------------------------------------

//USER PROFILE LOAD
const loadProfile = async (req, res) => {
    try {
      const userData1 = req.session.user_id;
      const id = userData1;
  
      const userData = await User.findById(id);
      const currentBalance=userData.wallet

      console.log(currentBalance,"currentBalance",798);

  
      if (!userData) {
        res.redirect("/logout");
      } else {
        const categories = await Category.find();
  
        console.log(categories, 383, "ind");
  
        res.render("users/profile", {
          userData,
          userData1,
          categories,
          currentBalance,
          isLogged: req.session.userName
        });
      }
    } catch (error) {
      console.log(error.message);
      res.status(500).send('Internal Server Error');
    }
  };
  


//LOAD EDIT PROFILE----------------------------------

const loadEditProfile = async (req, res) => {
    try {
      const userData1 = req.session.user_id;
  
      const id = req.query._id;

      const userData = await User.findById({_id:req.session.user_id});
      console.log('user DATA '+userData,410)
      res.render("users/editprofile", {
        userData: userData.name,
        userData1,
      });

      console.log("loadEditProfile",userData,415);
    } catch (error) {
      console.log(error.message);
    }
  };



  //USER PROFILE EDIT------------------
const editProfile = async (req, res) => {
  try {
    const userData1 = req.session.user_id;

    const id = req.body._id;

    console.log(req.body._id,426);

    if (!id) {
      throw new Error('Invalid user ID');
    }

    const userData = await User.findByIdAndUpdate(
      id,
      {
        name: req.body.name,
        email: req.body.mail,
        mobile: req.body.mobile,
      },
      { new: true }
    );
 
    res.render("users/profile", { userData, userData1 });
  } catch (error) {
    console.log(error.message);
    // Handle the error appropriately, such as sending an error response
    res.status(500).send('Internal Server Error');
  }
};
//-----------------------------------------------------------------------------------------------------------------------

//USER-ADDRESSS---------------------------------------------------------------------------------------------

//LOAD ADDRESSES
const loadAddress = async (req, res) => {
    try {
      const userData1 = req.session.user_id;
      const addressData = await Address.find({ owner: userData1 });
  
      res.render("users/address", {
        userData1,
        addressData: addressData,
      });
    } catch (error) {
      console.log(error.message);
    }
  };


  //LOAD ADD ADDRESS
const loadAddAddress = async (req, res) => {
    try {
      const userData1 = req.session.user_id;
      res.render("users/addaddress", { userData1 });
    } catch (error) {
      console.log(error.message);
    }
  };



  //POST ADD ADDRESS
const addAddress = async (req, res) => {
  
    try {
      const userData1 = req.session.user_id;
      if (
        //null validation
        Object.values(req.body).some(
          (value) => !value.trim() || value.trim().length === 0
        )
      ) {
        res.render("users/addaddress", { message1: "Please fill the field" });
      } else {
        const address = new Address({
          owner: userData1,
          name: req.body.name,
          mobile: req.body.mobile,
          address1: req.body.address1,
          address2: req.body.address2,
          city: req.body.city,
          state: req.body.state,
          pin: req.body.pin,
          country: req.body.country,
        });
        const addressData = await address.save();
        if (addressData) {
          res.redirect("/address");
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };




//LOAD EDIT ADDRESS
const loadEditAddress = async (req, res) => {
    try {
      const userData1 = req.session.user_id;
      const id = req.query.id;
      const addressData = await Address.findById(id);
  
      res.render("users/editaddress", { userData1, addressData });
    } catch (error) {
      console.log(error.message);
    }
  };
  
  //EDIT ADDRESS
  const editAddress = async (req, res) => {
    try {
      const id = req.body.id;
      await Address.findByIdAndUpdate(
        { _id: id },
        {
          name: req.body.name,
          mobile: req.body.mobile,
          address1: req.body.address1,
          address2: req.body.address2,
          city: req.body.city,
          state: req.body.state,
          pin: req.body.pin,
          country: req.body.country,
        },
        { new: true }
      );
      res.redirect("/address");
    } catch (error) {
      console.log(error.message);
    }
  };


  
  //DELETE ADDRESS
  const deleteAddress = async (req, res) => {
    try {
      const id = req.query.id;
      await Address.findByIdAndDelete({ _id: id });
      res.redirect("/address");
    } catch (error) {
      console.log(error.message);
    }
  };


///ORDER HISTORY
const orderHistory = async (req, res) => {
  try {
    const userData1 = req.session.user_id;
    const orderData = await Order.find({ owner: userData1})
      .populate("items.product_id")
      .populate("shippingAddress")
      .sort({ dateOrdered: -1 });

      console.log(orderData);
    res.render("users/orderhistory", { userData1, orderData });
  } catch (error) {
    console.log(error.message);
  }
};




//LOAD ORDER HISTORY DETAILS
const orderHistoryDetails = async (req, res) => {
  try {
    const userData1 = req.session.user_id;

    // const orderData = await Order.find({ owner: userData1._id }).populate('items.product_id').populate('shippingAddress')
    // console.log('this is zorerdata');
    // console.log(orderData);
    // console.log('this is zoorderdatas items');
    // const obj=orderData.items
    // console.log(obj);

    const id = req.query.id;
    const orderDetail = await Order.findById(id)
      .populate("items.product_id")
      .populate("shippingAddress")
      .populate("owner");
    //const itemsData = orderDetail.items;

    console.log(orderDetail.status,880,"orderDetail");                                   

    res.render("users/orderhistorydetails", {
      userData1,
      orderDetail,
    });
  } catch (error) {
    console.log(error.message);
  }
};


let  paymentMethod

//CANCEL ORDER
const orderCancel = async (req, res) => {
  try {
    const userId=req.session.user_id;
    const userData=await User.findById(userId)
    const orderId=req.body.id

    const orderData= await Order.findById(orderId)
    const paymentMethod = orderData.paymentMode
    const currentBalance=userData.wallet
    const refundAmount =orderData.totalBill;

    const updateTotalAmount=currentBalance+refundAmount
    console.log(updateTotalAmount,1058);

    if(paymentMethod == "razorpay" ||paymentMethod =="wallet"){
      console.log('this is inside if')
      const updatewalletAmount=await User.findByIdAndUpdate(

        userData._id,
        {$set:{wallet:updateTotalAmount}},
        {new:true})

        console.log("order completed");
      
    }

    

    


    const { id } = req.body;
    const updatedData = await Order.findByIdAndUpdate(
      { _id: id },
      { status: "cancelled" },
      { new: true }
    );
    res.json(updatedData);
  } catch (error) {
    console.log(error.message);
  }
};



// Return Order
const orderReturn = async (req, res) => {
  try {

    const userId=req.session.user_id;
    const userData=await User.findById(userId)
    const orderId=req.body.id

    const orderData= await Order.findById(orderId)
    const paymentMethod = orderData.paymentMode
    const currentBalance=userData.wallet
    const refundAmount =orderData.totalBill;

    const updateTotalAmount=currentBalance+refundAmount
    console.log(updateTotalAmount,1058);

    
      const updatewalletAmount=await User.findByIdAndUpdate(

        userData._id,
        {$set:{wallet:updateTotalAmount}},
        {new:true})

        console.log("order completed");
      



    const { id } = req.body;
    const updatedData = await Order.findByIdAndUpdate(
      id,
      { status: 'returned' },
      { new: true }
    );
    res.json(updatedData);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
};




//forget password-------------------------------------------------------------



const forgetLoad = async (req, res) => {
    try {
        res.render('users/forget')

    } catch (error) {
        console.log(error.message);
    }
}








const forgetVerify = async (req, res) => {
  
   
    try {

        resetMail = req.body.email;
        const userData = await User.findOne({ email: resetMail })
        
        if (userData) {
            
            if (userData.is_verified === 0) {
                res.render('users/forget', { message: "Please verify your email " })


            } else {

                const rendomString = randomstring.generate();
                const updatedData = await User.updateOne({ email: resetMail }, { $set: { token: rendomString } });
                sendResetPasswordMail(userData.name, userData.email, rendomString);
                res.redirect('/otpforgotpassword')
            }
        } else {

            res.render('users/forget', { message: "User email is incorrect" })

        }

    } catch (error) {
        console.log(error.message);
    }
}

const forgetPasswordOtpLoad=async(req,res)=>{
    try {
        res.render('users/otpforgotpassword')
    } catch (error) {
        console.log(error.message);
    }
}
const forgetVerifyotp=async(req,res)=>{
    const forgototp=req.body.otp
    try {
        if(otp==forgototp){
            res.render('users/resetpassword1')
        }else{
            res.redirect('users/otpforgotpassword',{message:'Entered otp wrong'})
        }
    } catch (error) {
        console.log(error.message);
    }
}

const loadresetpassword=async(req,res)=>{
    try {
        res.render('users/resetpassword1')
    } catch (error) {
        console.log(error.message);
    }
}


const resetpassword = async (req, res) => {
    // Get the email and new password from the request body
    const password  = req.body.password
  
    try {
      // Hash the new password using your `securePassword` function
      const hashedPassword = await securePassword(password);
  
      // Find the user by their email and update their password
      const user = await User.updateOne({ email: resetMail }, { $set: { password: hashedPassword } });
  
      // If the user was found and their password was updated successfully, redirect to the login page
      if (user) {
        resetMail=null
        res.redirect('/login');
      } else {
        // If the user was not found, render an error page
        //res.render('error', { message: 'User not found' });
      }
    } catch (error) {
      console.log(error.message);
      // If there was an error, render an error page with the error message
      //res.render('error', { message: error.message });
    }
  };
  



const forgetPasswordLoad = async (req, res) => {
    try {

        const token = req.query.token;
        const tokenData = await User.findOne({ token: token });
        if (tokenData) {
            res.render('forget-password', { user_id: tokenData_id })
        } else {
            res.render('404', { message: "Tokken is invalid" })
        }
    } catch (error) {
        console.log(error.message);
    }
}

//----
const resetPassword = async (req, res) => {
    try {
        const password = req.body.password;
        const user_id = req.body.user_id;

        const secure_Password = await securePassword(password);

        const updateData = await User.findByIdAndUpdate({ _id: user_id }, { $set: { password: secure_Password, token: '' } })

        res.redirect("/")
    } catch (error) {
        console.log(error.message);
    }
}




module.exports = {
    loadRegister,
    insertUser,
    verifyMail,
    loginLoad,
    verifyLogin,
    loadHome,

    shopByCategory,
    loadShop,
    loadCategoryProducts,
    loadDeatails,

    interConnect,
    //search,
    sort,
    userLogout,
    invoiceDownload,

    loadProfile,
    loadEditProfile,
    editProfile,

    loadAddress,
    loadAddAddress,
    addAddress,
    loadEditAddress,
    editAddress,
    deleteAddress,

    orderHistory,
    orderHistoryDetails,
    orderCancel,
    orderReturn,


    forgetLoad,
    forgetVerify,
    forgetPasswordLoad,
    resetPassword,
    loadverifyotp,
    verifyotp,
    forgetPasswordOtpLoad,
    forgetVerifyotp,
    loadresetpassword,
    resetpassword,
   
}


