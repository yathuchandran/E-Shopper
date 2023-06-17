const mongoose = require('mongoose')
const express = require("express");
const app = express();
const hbs = require("hbs")
const path = require("path");
const morgan = require('morgan')
const razorpay = require('razorpay')


mongoose.connect("mongodb+srv://yatheeshbc8:sanidhya*88@cluster0.sjvvmgl.mongodb.net/?retryWrites=true&w=majority");
mongoose.set("strictQuery", false);




app.use(morgan("dev"))
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(path.join(__dirname, "public"))); //Register your public folder to express in your .js file by


const handlebars = require('handlebars');

handlebars.registerHelper('json', function(context) {
  return JSON.stringify(context);
});

// Rest of your code


// app.use(
//   session({
//     secret: config.sessionSecret,
//     saveUnintialized: true,
//     cookie: { maxAge: 600000 },
//     resave: false
//   })
// );


//const multer = require("multer");
const createError = require('http-errors')


hbs.registerPartials(__dirname + '/views/partial',);


hbs.registerHelper('ifeq', function (a, b, options) {
    if (a == b) { return options.fn(this); }
    return options.inverse(this);
});

hbs.registerHelper('ifnoteq', function (a, b, options) {
    if (a != b) { return options.fn(this); }
    return options.inverse(this);
});


//view engine setup
app.set('view engine', 'hbs')
app.set('views', './views')

app.use(function(req, res, next) { 
    res.header('Cache-Control', 'no-cache, no-store');
    next();
});
  
//register partial route setup
app.use(express.static(__dirname + '/public'));
const bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))


//for user routes....
const userRoute = require('./routes/userRoute')

//HELPERS
hbs.registerHelper("calcTotal", function (quantity, price) {
    return "" + quantity * price;
  });
  
  hbs.registerHelper("eq", function (a, b) {
    return a === b;
  });
  
  
  hbs.registerHelper("or", function (x,y) {
    return x || y;
  })
  

hbs.registerHelper('formatDate', function(date, format) {
    const options = {
     
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Kolkata'
    };
    const formattedDate = new Date(date).toLocaleString('en-US', options);
    return formattedDate;
  });

  

  
hbs.registerHelper('slice', function(context, start, end) {
  return context.slice(start, end);
});


hbs.registerHelper('each_from_three', function(context, options) {
  var ret = "";
  for(var i=0; i<3 && i<context.length; i++) {
      ret += options.fn(context[i]);
  }
  return ret;
});

hbs.registerHelper('eq', function (a, b) {
  return a === b;
});

hbs.registerHelper('checkStock', function(stock, options) {
  if (stock <= 5) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

hbs.registerHelper('ifCond', function(v1, v2, options) {
  if (v1 === v2) {
    return options.fn(this);
  }
  return options.inverse(this);
});





app.use('/', userRoute)

//for admin routes
const adminRoute = require('./routes/adminRoute');
const { log } = require('console');
app.use('/admin', adminRoute);



const PORT=3000 || 4000

app.listen(PORT, function () {
    console.log(`server is running...${PORT}`);
})



