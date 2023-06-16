
const Product = require("../model/product");//mongodb category model
const Category = require("../model/category");

//const product = require("../model/product");
//const fs = require("fs")
//const {findByIdAndUpdate,findById}=require("../model/product")

//LIST PRODUCT----------------------------
const listProduct = async (req, res) => {
    try {
        const productData = await Product.find();
        const categoryData = await Category.find();
        res.render('admin/product', { product: productData,categoryData})
       
    } catch (error) {
        console.log(error.message);
    }
}


//LOAD ADD product----------------------------------------
const productLoad = async (req, res) => {
    try {
        const categoryData = await Category.find();
        res.render('admin/addProduct', { categoryData });
    } catch (error) {
        console.log(error.message);
    }
};


//ADD PRODUCT--------------------------------------------------------------
const addProduct = async (req, res) => {
    try {

        if (Object.values(req.body).some(
            (value) => !value.trim() || value.trim().length === 0
        )) {
            res.render("admin/addProduct", { message1: "Please fill the field" });
        } else {

            const name = req.body.name;
            const productData = await Product.findOne({ name: name })

            const images = []
            const file = req.files;
            file.forEach((element) => {
                const image = element.filename;
                images.push(image)
            });


            if (productData == null) {
                
                const product = new Product({
                    name: req.body.name,
                    description: req.body.description,
                    image: images,
                    category: req.body.category,
                    price: req.body.price,
                    brand: req.body.brand,
                    quantity: req.body.quantity,
                    is_blocked: false
                });

                await product.save();
                res.render("admin/addProduct", { message: "Product added succesfuly" });
            } else {

                if (productData.name == name)
                    res.render('admin/addProduct', { message: 'Product already exists.... ' });
            }
        }
    } catch (error) {
        console.log(error.message);
    }
};


//LOAD EDIT PRODUCT-----------------------------------

const loadEditProduct = async (req, res) => {
    try {
        const id = req.query.id
        const categoryData = await Category.find();
        const productData = await Product.findById({ _id: id })
        if (productData) {
            res.render('admin/editproduct', { product: productData, categoryData: categoryData });
        }
        else {
            res.render('admin/product')
        }

    } catch (error) {
        console.log(error.message);
    }
};


//EDIT PRODUCT-----------------------------------------------
//OLD-----------
const editProduct = async (req, res) => {
    try {
        const id = req.query.id

        const productData = await Product.findById({ _id: id });
        const oldPhotosArray = productData.image

        let newArray = []

        //IMAGES FROM BODY------

        const images = []
        const file = req.files
        file.forEach((element) => {
            const image = element.filename
            images.push(image)
        })


        //CONCATING TWO ARRAYS USING SPREAD OPERATOR------
        newArray = [...oldPhotosArray, ...images]
        if(req.body.name && req.body.description &&  req.body.category && req.body.price &&req.body.brand && req.body.quantity) {

        await Product.findByIdAndUpdate(
            { _id: id },
            {
                name: req.body.name,
                description: req.body.description,
                image: newArray,
                category: req.body.category,
                price: req.body.price,
                brand: req.body.brand,
                quantity: req.body.quantity

            },
            { new: true }

        );
        }else{
            res.redirect("/admin/editproduct");
        }
        res.redirect("/admin/product");
    } catch (error) {
        console.log(error.message);
    }
};


//NEW DELETE SINGLE IMAGE-----------------
const deleteProdImage = async (req, res) => {
    try {

        const { id, image } = req.query
        const productData = await Product.findById(id)
        productData.image.splice(image, 1)
        await productData.save()
        res.status(200).send({ message: 'Image deleted succesfully' });

    } catch (error) {
        res.status(500).send({ error: error.message });
    }
}






//block product--------------------------------------------------------------
const blockProduct = async (req, res) => {
    const blockid = req.params.id
    const blockProductData = await Product.findById(blockid)
    const block_status = blockProductData.is_blocked

    try {
        const final = await Product.findByIdAndUpdate(blockid, { $set: { is_blocked: !block_status } }, { new: true })
        res.redirect('/admin/product')
    } catch (error) {
        console.log(error.message);
    }
}


//USER SIDE PRODUCT LOAD AKNEDH---------
const loadproductlist =async(req,res)=>{
    try {
        const data =req.session.user_id;
        const categorydata=await Category.find()

        const options={
            page:req.query.page||1, //get current page number from params
            limits:8,
            query:{is_blocked:true}
        };
        let result;
        const selectedCategoryId=req.body.categoryid;

        if (selectedCategoryId) {
            result =await Product.paginate(
                {category:selectedCategoryId,is_blocked:false},
                options
            );
        } else {
            result =await Product.paginate({is_blocked:false},options)
        }
        res.render('users/productlist ',{productData:result,data,categorydata});
    } catch (error) {
        console.log(error.message);
    }
}



module.exports = {
    listProduct,
    productLoad,
    addProduct,
    loadEditProduct,
    editProduct,
    deleteProdImage,
    loadproductlist,

    blockProduct

}
