const Admin = require("../../model/adminModel");
const User = require("../../model/userModel");
const Order = require("../../model/orderModel");
const Product = require("../../model/product");
const Category = require("../../model/category");
const ExcelJS = require("exceljs");
//const moment = require("moment");
const hbs = require("hbs");

let dailyorders;
let totalOrderBill;
let monthlyOrders;
let totalMonthlyBill;
let yearlyorders;
let totalYearlyBill;

hbs.registerHelper("json", function (context) {
  return JSON.stringify(context);
});

const loadDashboard = async (req, res) => {
  try {
    const id = req.session.admin_id;
    const adminData = await Admin.findById({ _id: id });
    res.render("adminViews/adminDashboard", { admin: adminData });
  } catch (error) {
    res.status(500).send({message:`${error}`})
  }
};

const homeload = async (req, res) => {
  try {
    const users = await User.find({}).count();
    const products = await Product.find({}).count();
    const orders = await Order.find({}).count();
    const allOrders = await Order.find({ status: "delivered" });
    const totalRevenue = allOrders.reduce(
      (total, order) => total + Number(order.orderBill),
      0
    );


    
    //category sales
    const categorysale = await Order.aggregate(
      [//
        {
          $lookup: {
            from: "addresses", // Name of the collection joining with
            localField: "address",
            foreignField: "_id",
            as: "address", // Name of the array field where the joined documents will be stored
          },
        },
        {
          $unwind: "$items", // Deconstruct the items array
        },
        {
          $lookup: {
            from: "products", // Name of the collection  joining with
            localField: "items.product",
            foreignField: "_id",
            as: "product", // Name of the array field where the joined documents will be stored
          },
        },
        {
          $unwind: "$product", // Deconstruct the product array
        },
        {
          $group: {
            _id: "$product.category",
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "categories", // Name of the collection joining with
            localField: "_id",
            foreignField: "_id",
            as: "category", // Name of the array field where the joined documents will be stored
          },
        },
        {
          $unwind: "$category", // Deconstruct the category array
        },
        {
          $project: {
            _id: 0,
            category: "$category.name",
            count: 1,
          },
        },
      ],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          console.log(result);
        }
      }
    );




    const cashOnDeliveryCount = await Order.countDocuments({
      paymentMode: "cashondelivery",
    });


    const razorPayCount = await Order.countDocuments({
      paymentMode: "razorpay",
    });



    const pipeline = [
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateFromParts: {
              year: "$_id.year",
              month: "$_id.month",
              day: 1,
            },
          },
          count: 1,
        },
      },
      {
        $sort: {
          date: 1,
        },
      },
    ];
    const ordersByMonth = await Order.aggregate(pipeline);
    const orderCounts = ordersByMonth.map(({ date, count }) => ({
      month: date.toLocaleString("default", { month: "long" }),
      count,
    }));

    res.render("adminViews/adminhome", {
      cashOnDeliveryCount,
      razorPayCount,
      orderCounts,
      users,
      products,
      orders,
      totalRevenue,
      categorysale,
    });
  } catch (error) {
    console.error(error);
  }
};




// const dailysales = async (req, res) => {
//   try {

//   const orderDate = req.body.daily;
//   const oDate = moment(orderDate).format("DD-MM-YYYY");
//   dailyorders = await Order.find({ orderDate: oDate }).populate("address");
//   totalOrderBill = dailyorders.reduce(
//     (total, order) => total + Number(order.orderBill),
//     0
//   );
//   res.render("adminViews/dailysales", { dailyorders, totalOrderBill });
// } catch (error) {
//   res.status(500).send({message:`${error}`})
// }
// };


// const dailyDownload = async (req, res) => {
//   const workbook = new ExcelJS.Workbook();
//   const worksheet = workbook.addWorksheet("Sales Data");
//   worksheet.columns = [
//     { header: "Order ID", key: "orderId", width: 10 },
//     { header: "Delivery Name", key: "deliveryName", width: 20 },
//     { header: "Order Date", key: "orderDate", width: 15 },
//     { header: "Discount", key: "discount", width: 10 },
//     { header: "Total Bill", key: "totalBill", width: 10 },
//     { header: "totalOrders", key: "totalOrders", width: 10 },
//     { header: "totalRevenue", key: "totalRevenue", width: 20 },
//   ];

//   dailyorders.forEach((order) => {
//     worksheet.addRow({
//       orderId: order.orderId,
//       deliveryName: order.address.name,
//       orderDate: order.orderDate,
//       discount: order.discount,
//       totalBill: order.orderBill,
//     });
//   });
//   worksheet.addRow({
//     totalOrders: dailyorders.length,
//     totalRevenue: totalOrderBill,
//   });
//   res.setHeader(
//     "Content-Type",
//     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//   );
//   res.setHeader(
//     "Content-Disposition",
//     "attachment; filename=" + "SalesData.xlsx"
//   );

//   workbook.xlsx
//     .write(res)
//     .then(() => {
//       res.end();
//     })
//     .catch((err) => {

//       res.status(500).send("An error occurred while generating the Excel file");
//     });
// };



// const monthlysales = async (req, res) => {
//   try {
//     const monthinput = req.body.month;
//     const year = parseInt(monthinput.substring(0, 4));
//     const month = parseInt(monthinput.substring(5));
//     const startDate = new Date(year, month - 1, 1);
//     const endDate = new Date(year, month, 0);
//     monthlyOrders = await Order.aggregate([
//       {
//         $match: {
//           createdAt: {
//             $gte: startDate,
//             $lte: endDate,
//           },
//         },
//       },
//       {
//         $sort: {
//           orderDate: 1, // Sort the documents by order date in ascending order
//         },
//       },
//     ]);

//     totalMonthlyBill = monthlyOrders.reduce(
//       (total, order) => total + Number(order.orderBill),
//       0
//     );

//     res.render("adminViews/monthlyOrders", { monthlyOrders, totalMonthlyBill });
//   } catch (error) {
//     res.status(500).send({message:`${error}`})
//   }
// };
// const monthlyDownload = async (req, res) => {
//   const workbook = new ExcelJS.Workbook();
//   const worksheet = workbook.addWorksheet("Sales Data");
//   // Add headers to the worksheet
//   worksheet.columns = [
//     { header: "Order ID", key: "orderId", width: 10 },
//     { header: "Order Date", key: "orderDate", width: 15 },
//     { header: "Discount", key: "discount", width: 10 },
//     { header: "Total Bill", key: "totalBill", width: 10 },
//     { header: "totalOrders", key: "totalOrders", width: 10 },
//     { header: "totalRevenue", key: "totalRevenue", width: 20 },
//   ];

//   monthlyOrders.forEach((order) => {
//     worksheet.addRow({
//       orderId: order.orderId,
//       orderDate: order.orderDate,
//       discount: order.discount,
//       totalBill: order.orderBill,
//     });
//   });
//   worksheet.addRow({
//     totalOrders: monthlyOrders.length,
//     totalRevenue: totalMonthlyBill,
//   });
//   res.setHeader(
//     "Content-Type",
//     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//   );
//   res.setHeader(
//     "Content-Disposition",
//     "attachment; filename=" + "SalesData.xlsx"
//   );

//   workbook.xlsx
//     .write(res)
//     .then(() => {
//       res.end();
//     })
//     .catch((err) => {
//       res.status(500).send("An error occurred while generating the Excel file");
//     });
// };

// const yearlysales = async (req, res) => {
//   try {
//   const orders = await Order.find();
//   const year = req.body.yearly;
//   yearlyorders = orders.filter(
//     (order) => order.createdAt.getFullYear() === parseInt(year)
//   );
//   totalYearlyBill = yearlyorders.reduce(
//     (total, order) => total + Number(order.orderBill),
//     0
//   );
//   res.render("adminViews/yearlyorders", { yearlyorders, totalYearlyBill });
// } catch (error) {
//   res.status(500).send({message:`${error}`})
// }
// };

// const yearlydownload = async (req, res) => {
//   const workbook = new ExcelJS.Workbook();
//   const worksheet = workbook.addWorksheet("Sales Data");

//   // Add headers to the worksheet
//   worksheet.columns = [
//     { header: "Order ID", key: "orderId", width: 10 },
//     { header: "Order Date", key: "orderDate", width: 15 },
//     { header: "Discount", key: "discount", width: 10 },
//     { header: "Total Bill", key: "totalBill", width: 10 },
//     { header: "totalOrders", key: "totalOrders", width: 10 },
//     { header: "totalRevenue", key: "totalRevenue", width: 20 },
//   ];

//   yearlyorders.forEach((order) => {
//     worksheet.addRow({
//       orderId: order.orderId,
//       orderDate: order.orderDate,
//       discount: order.discount,
//       totalBill: order.orderBill,
//     });
//   });
//   worksheet.addRow({
//     totalOrders: yearlyorders.length,
//     totalRevenue: totalYearlyBill,
//   });
//   res.setHeader(
//     "Content-Type",
//     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//   );
//   res.setHeader(
//     "Content-Disposition",
//     "attachment; filename=" + "SalesData.xlsx"
//   );

//   workbook.xlsx
//     .write(res)
//     .then(() => {
//       res.end();
//     })
//     .catch((err) => {

//       res.status(500).send("An error occurred while generating the Excel file");
//     });
// };

//exports
// module.exports = {
//   loadDashboard,
//   homeload,
//   dailysales,
//   dailyDownload,
//   monthlysales,
//   monthlyDownload,
//   yearlysales,
//   yearlydownload,
// };




// const reports = async (req, res) => {
//   try {
//     const ordersdata = await orders.find().populate('items.product').sort({ orderdate: -1 })
//     res.render('report', { orders: ordersdata })

//   } catch (error) {
//     console.error(error.message);
//   }
// }
// let monthlyorderdata
// const getorders = async (req, res) => {
//   try {
//     const fromdate = req.body.fromDate
//     const toDate = req.body.toDate
//     monthlyorderdata = await orders.find({ orderdate: { $gte: fromdate, $lte: toDate } }).populate('items.product').sort({ orderdate: -1 })
//     res.json({ orderdata: monthlyorderdata })
//   } catch (error) {
//     console.log(error.message);
//   }
// }

// const excelDownload = async (req, res) => {
//   const workbook = new ExcelJS.Workbook();
//   const worksheet = workbook.addWorksheet("Sales Data");

//   // Add headers to the worksheet
//   worksheet.columns = [
//     { header: "Order ID", key: "_id", width: 10 },
//     { header: "Order Date", key: "orderdate", width: 15 },
//     { header: "Total Bill", key: "totalBill", width: 10 },
//     { header: "totalOrders", key: "totalOrders", width: 10 },
//     { header: "totalRevenue", key: "totalRevenue", width: 20 },
//   ];

//   let sum = 0
//   monthlyorderdata.forEach(element => {
//     sum += Number(element.totalbill)
//   });

//   monthlyorderdata.forEach((order) => {
//     worksheet.addRow({
//       OrderId: order._id,
//       OrderDate: order.orderdate,
//       totalBill: order.totalbill,
//     });

//   });
//   worksheet.addRow({
//     totalOrders: monthlyorderdata.length,
//     totalRevenue: sum,
//   });
//   res.setHeader(
//     "Content-Type",
//     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//   );
//   res.setHeader(
//     "Content-Disposition",
//     "attachment; filename=" + "SalesData.xlsx"
//   );

//   workbook.xlsx
//     .write(res)
//     .then(() => {
//       res.end();
//     })
//     .catch((err) => {
//       console.log(err);
//       res.status(500).send("An error occurred while generating the Excel file");
//     });
// };






// const reports = async (req, res) => {
//   try {
//     const ordersdata = await orders.find().populate('items.product').sort({ orderdate: -1 })
//     res.render('report', { orders: ordersdata })

//   } catch (error) {
//     console.error(error.message);
//   }
// }
// let monthlyorderdata
// const getorders = async (req, res) => {
//   try {
//     const fromdate = req.body.fromDate
//     const toDate = req.body.toDate
//     monthlyorderdata = await orders.find({ orderdate: { $gte: fromdate, $lte: toDate } }).populate('items.product').sort({ orderdate: -1 })
//     res.json({ orderdata: monthlyorderdata })
//   } catch (error) {
//     console.log(error.message);
//   }
// }

// const excelDownload = async (req, res) => {
//   const workbook = new ExcelJS.Workbook();
//   const worksheet = workbook.addWorksheet("Sales Data");

//   // Add headers to the worksheet
//   worksheet.columns = [
//     { header: "Order ID", key: "_id", width: 10 },
//     { header: "Order Date", key: "orderdate", width: 15 },
//     { header: "Total Bill", key: "totalBill", width: 10 },
//     { header: "totalOrders", key: "totalOrders", width: 10 },
//     { header: "totalRevenue", key: "totalRevenue", width: 20 },
//   ];

//   let sum = 0
//   monthlyorderdata.forEach(element => {
//     sum += Number(element.totalbill)
//   });

//   monthlyorderdata.forEach((order) => {
//     worksheet.addRow({
//       OrderId: order._id,
//       OrderDate: order.orderdate,
//       totalBill: order.totalbill,
//     });

//   });
//   worksheet.addRow({
//     totalOrders: monthlyorderdata.length,
//     totalRevenue: sum,
//   });
//   res.setHeader(
//     "Content-Type",
//     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//   );
//   res.setHeader(
//     "Content-Disposition",
//     "attachment; filename=" + "SalesData.xlsx"
//   );

//   workbook.xlsx
//     .write(res)
//     .then(() => {
//       res.end();
//     })
//     .catch((err) => {
//       console.log(err);
//       res.status(500).send("An error occurred while generating the Excel file");
//     });
// };


