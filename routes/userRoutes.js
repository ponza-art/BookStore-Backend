
const express = require("express");
const router = express.Router();
const {getAllUsers,register,login,createAdmin, googleLogin, editUserStatus,updateProfile,getUserProfile} =require("../controllers/userController");
const { validateUser, validateLoginUser } = require("../middleware/middelwareUser");
const verifyAdmin=require("../middleware/verifyAdmin2")
const verifyUser=require("../middleware/verifyToken")



router.get("/",verifyAdmin,getAllUsers)
router.post("/register",validateUser, register)
router.post("/login",validateLoginUser,login)
router.post("/create-admin",verifyAdmin,createAdmin)
router.get("/google",googleLogin)
router.patch("/edit-status", verifyAdmin, editUserStatus);
router.patch("/profile",verifyUser, updateProfile);
router.get("/profile", verifyUser, getUserProfile);




module.exports=router
