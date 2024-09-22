const express = require("express");
const {
  createCategory,
  updateCategory,
  deleteCategory,
  getaCategory,
  getallCategory,
} = require("../controllers/categoryController");
const router = express.Router();

router.post("/create", createCategory);
router.put("/update/:id", updateCategory);
router.delete("/delete/:id", deleteCategory);
router.get("/:id", getaCategory);
router.get("/", getallCategory);
module.exports = router;
