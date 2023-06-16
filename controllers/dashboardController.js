const User = require("../model/userModel"); //mongodb user model
const Product = require("../model/product");
const Order = require("../model/orderModel");
// const moment = require("moment");
const hbs = require("hbs");
const ExcelJS = require('exceljs');


//HELPER TO RETURN JSON OBJECT IN HBS
hbs.registerHelper("json", function (context) {
  return JSON.stringify(context);
});


const homeload = async (req, res) => {
  try {
    const users = await User.countDocuments({});
    const products = await Product.countDocuments({});
    const orders = await Order.countDocuments({});
    const allOrders = await Order.find({ status: "delivered" });
    console.log("orders delivered: " + allOrders.length);

    const totalRevenue = allOrders.reduce((total, order) => total + (order.totalBill || 0), 0);
    console.log("the total revenue is " + totalRevenue);

    const categorysale = await Order.aggregate([
      {
        $lookup: {
          from: "addresses",
          localField: "shippingAddress",
          foreignField: "_id",
          as: "address",
        },
      },
      {
        $unwind: "$items",
      },
      {
        $lookup: {
          from: "products",
          localField: "items.product_id",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
      {
        $group: {
          _id: "$product.category",
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $project: {
          category: "$category.name",
          count: "$count",
        },
      },
    ]);

    // The resulting categorysale data can be used in your frontend chart code



    console.log("categorysale total " + categorysale.length);

    const cashOnDeliveryCount = await Order.countDocuments({
      paymentMode: "cashondelivery",
    });

    console.log(cashOnDeliveryCount, "cashOnDeliveryCount");

    const razorPayCount = await Order.countDocuments({
      paymentMode: "razorpay",
    });

    console.log(razorPayCount, "razorPayCount");

    const pipeline = [
      {
        $group: {
          _id: {
            year: { $year: "$dateOrdered" },
            month: { $month: "$dateOrdered" },
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

    console.log(ordersByMonth, "ordersByMonth");

    res.render("admin/dashboard", {
      cashOnDeliveryCount,
      razorPayCount,
      orderCounts,
      users,
      products,
      orders,
      totalRevenue,
      categorysale: JSON.stringify(categorysale),
    });
  } catch (error) {
    console.log(error.message);
  }
};






const reports = async (req, res) => {
  try {
    const ordersData = await Order.find()
      .populate('items.product_id')
      .sort({ dateOrdered: -1 });

    res.render('admin/salesreport', { orders: ordersData });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while fetching sales reports.');
  }
};


let monthlyorderdata=[];
const getOrders = async (req, res) => {
  try {
    const fromDate = req.body.fromDate;
    const toDate = req.body.toDate;

    const monthlyorderdata = await Order.find({ dateOrdered: { $gte: fromDate, $lte: toDate } })
      .populate('items.product_id')
      .sort({ dateOrdered: -1 });

    console.log('Monthly Order Data:', 174, monthlyorderdata);

    res.json({ orders: monthlyorderdata });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};





  //EXCEL FILE DOWNLOAD
  const excelDownload = async (req, res) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sales Data");
  
   // Add headers to the worksheet
    worksheet.columns = [
      { header: "Order ID", key: "_id", width: 30 },
      { header: "Order Date", key: "orderdate", width: 15 },
      { header: "Total Bill", key: "totalBill", width: 10 },
      { header: "totalOrders", key: "totalOrders", width: 10 },
      { header: "totalRevenue", key: "totalRevenue", width: 20 },
    ];

    let sum = 0
    monthlyorderdata.forEach(element => {
      sum += Number(element.totalBill)
    });
  
    monthlyorderdata.forEach((order) => {
      worksheet.addRow({
        _id: order._id,
        orderdate: order.dateOrdered,
        totalBill: order.totalBill,
      });
    });

    worksheet.addRow({
      totalOrders: monthlyorderdata.length,
      totalRevenue: sum,
    });
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + "SalesData.xlsx"
    );
  
    workbook.xlsx
      .write(res)
      .then(() => {
        res.end();
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("An error occurred while generating the Excel file");
      });
  };


module.exports = {
  homeload,
  reports,
  getOrders,
  excelDownload
}

