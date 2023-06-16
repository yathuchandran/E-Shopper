
// Import the Category model
const Category = require('../model/category');






//LIST category-----------------------
const listCategory = async (req, res) => {
    try {

        const categories = await Category.find()
        
        res.render('admin/category', { category: categories })

    } catch (error) {
        console.log(error.message);
    }
}

//LOAD , ADD CATEGORY FORM---------------
const loadAddCategory = async (req, res) => {
    try {
        res.render("admin/addcategory");
    } catch (error) {
        console.log(error.message);
    }
};


//CREATE CATEGORY----------------------------
const insertCategory = async (req, res) => {
    try {
        const name = req.body.name;

        const nameLo = name.toLowerCase();
        const categoryData = await Category.findOne({ name: nameLo });
        if (name.trim() == '') {
            
            res.render("admin/addcategory", { message1: "Please enter valid name" })
        } else if (categoryData) {
            res.render("admin/addcategory", { message1: "Category exixts" });
        } else {

            const category = new Category({
                name: nameLo,
                image: req.file.filename,

            });
            const categoryy = await category.save();

            res.render("admin/addcategory", {
                message: "Category added successfully",
            });
        }
    } catch (error) {
        console.log(error.message);
    }
};


//LOAD EDIT CATEGORY-----------------
const loadEditCategory = async (req, res) => {
    try {
        const id = req.query.id;
        const categoryData = await Category.findById({ _id: id });
        if (categoryData) {
            res.render("admin/editcategory", { category: categoryData })//category data gets passed into html page while rendering in a variable 'category'.there category.xxx to be used to get values
        } else {
            res.redirect("admin/category");
        }
    } catch (error) {
        console.log(error.message);

    }
};

const updateCategoy = async (req, res) => {
    try {
        const id = req.query.id;
        const categoryData = await Category.find();
        const name = req.body.name;
        const nameLo=name.toLowerCase();

        const existingCategory = categoryData.find(
            category => category.name.toLowerCase() === nameLo && category._id != id
        );
        if (existingCategory) {
            return res.render("admin/editcategory", { message: "Category exists" });
        }


        const updateCategoy = await Category.findByIdAndUpdate(
            id,
            { name, image: req.file.filename },
            { new: true }
        );
        if (!updateCategoy) {
            return res.status(404).render("admin/editcategory", { message: "Caegory not found" })
        }

        res.redirect("/admin/category");
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error");
    }
};

const deleteCategory = async (req, res) => {

    try {
        const id = req.query.id;
        const category = await Category.findByIdAndDelete({ _id: id });
        res.redirect("/admin/category");
    } catch (error) {
        
        (error.message);
    }
};

module.exports = {
    listCategory,
    loadAddCategory,
    insertCategory,
    loadEditCategory,
    updateCategoy,
    deleteCategory


};

