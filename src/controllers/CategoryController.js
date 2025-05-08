const CategoryModel = require('../models/CategoryModel');

class CategoryController {
    async craeteCategory(req, res) {
        try {
            const newCategory = new CategoryModel(req.body);
            await newCategory.save();
            return res.status(201).json({
                status: 'success',
                message: 'Category created successfully',
                data: newCategory
            });
        }
        catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error',
                error: error.message
            });
        }
    }
    
    async getCategories(req, res) {
        try {
            const categories = await CategoryModel.find({ isDeleted: false });
            return res.status(200).json({
                status: 'success',
                message: 'Categories retrieved successfully',
                data: categories
            });
        }
        catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error',
                error: error.message
            });
        }
    }
}

module.exports = new CategoryController();