
const express = require("express");
const router = express.Router();
const {getAllUsers,register,login,createAdmin} =require("../controllers/userController");
const { validateUser, validateLoginUser } = require("../middleware/middelwareUser");
const verifyAdmin=require("../middleware/verifyAdmin2")



router.get("/",verifyAdmin,getAllUsers)
router.post("/register",validateUser, register)
router.post("/login",validateLoginUser,login)
router.post("/create-admin",verifyAdmin,createAdmin)




module.exports=router
