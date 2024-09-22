const Category = require("../models/categoryShema");
const AppError = require("../utils/appError");

const createCategory = async (req, res, next) => {
  try {
    const newCategory = await Category.create(req.body);
    res.json(newCategory);
  } catch (error) {
    next(new AppError("Failed to create catogery" + error, 500));
  }
};

const updateCategory = async (req, res, next) => {
  const { id } = req.params;
  try {
    const updateCategory = await Category.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updateCategory);
  } catch (error) {
    next(new AppError("Failed to update catogery" + error, 500));
  }
};
const deleteCategory = async (req, res, next) => {
  const { id } = req.params;
  try {
    const deleteCategory = await Category.findByIdAndDelete(id);
    res.json(deleteCategory);
  } catch (error) {
    next(new AppError("Failed to update catogery" + error, 500));
  }
};
const getaCategory = async (req, res, next) => {
    const { id } = req.params;
    try {
      const getaCategory = await Category.findById(id);
      res.json(getaCategory);
    } catch (error) {
      next(new AppError("Failed to update catogery" + error, 500));
    }
  };
  const getallCategory = async (req, res, next) => {
   
    try {
      const getallCategory = await Category.find();
      res.json(getallCategory);
    } catch (error) {
      next(new AppError("Failed to update catogery" + error, 500));
    }
  };
module.exports = { createCategory, updateCategory, deleteCategory,getaCategory,getallCategory };