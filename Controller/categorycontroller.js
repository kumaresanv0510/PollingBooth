
const CategoryCollection = require("../Model/categorymodel");

exports.createCategory = async(req,res,next)=>{
    try {
         const { category_name } = req.body;
         const newCategory = new CategoryCollection({
            category_name,
         });
         const saveCategory = await newCategory.save();
         return res.status(200).json(saveCategory);
    } catch (error) {
        return res.status(500).json({message:error.message})
    }
};
exports.getAll = async (req, res) => {
    try {
      const categories = await CategoryCollection.find();
      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching categories', error });
    }
};
exports.getCategoryById = async (req, res) => {
    try {
        const {category_id} = req.body;
        const category = await CategoryCollection.findOne({_id:category_id});
        if (!category) return res.status(404).json({ message: 'Category not found' });
        res.status(200).json(category);
       }
    catch (error) {
        res.status(500).json({ message: 'Error fetching category', error });
    }
};
exports.updateCategory = async (req, res) => {
    const { category_name, category_id } = req.body;
    try {
        const updateCategory = await CategoryCollection.findOne({_id : category_id});
        if(updateCategory)
            {
                updateCategory.category_name = category_name || updateCategory.category_name;
                await updateCategory.save();
                res.json({ message: 'Category updated successfully' });
            }
            else {
                res.status(404).json({ message: 'No categories found' });
            }
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating category', error });
    }
};
exports.deleteCategory = async (req, res) => {
    const { category_id } = req.body;
    try {
        const deletedCategory = await CategoryCollection.findByIdAndDelete({_id : category_id});
        if (!deletedCategory)
            {
            return res.status(404).json({ message: 'Category not found' });
            }
        res.status(200).json({ message: 'Category deleted successfully' });
      }
       catch (error) {
        res.status(500).json({ message: 'Error deleting category', error });
      }
};