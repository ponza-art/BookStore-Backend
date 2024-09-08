
const express = require("express");
const router = express.Router();
const {getAllUsers,register,login, logout} =require("../controllers/userController");
const { validateUser, validateLoginUser } = require("../middleware/middelwareUser");
const verifyToken=require("../middleware/verifyToken")
router.get("/",verifyToken,getAllUsers)
router.post("/register",validateUser, register)
router.post("/login",validateLoginUser,login)

router.post("/logout",logout)


module.exports=router