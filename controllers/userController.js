const asyncwrapper = require("../middleware/asyncWrapper");
const User = require("../models/userSchema");
const appError = require("../utils/appError");
const generateJWT = require("../utils/generateJWT");
const httpStatusText = require("../utils/httpStatusText");
const bcrypt = require("bcryptjs");
const getAllUsers = asyncwrapper(async (req, res, next) => {
  const Users = await User.find({}, { __v: 0, password: 0 });
  res
    .status(200)
    .json({ status: httpStatusText.SUCCESS, code: "200", data: { Users } });
});

const register = asyncwrapper(async (req, res, next) => {
  const { username, email, password } = req.body;

  const oldUser = await User.findOne({ email: email });
  if (oldUser) {
    const error = appError.create("Invalid Email", 400, httpStatusText.FAIL);
    return next(error);
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
  });
//token
    const token= await generateJWT({email:newUser.email,id:newUser._id})
      newUser.token=token;
  await newUser.save();
  res
    .status(201)
    .json({
      status: httpStatusText.SUCCESS,
      code: "200",
      data: { user: newUser },
    });
});


//login
const login = asyncwrapper(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email && !password) {
    const error = appError.create(
      "Email and password is required",
      400,
      httpStatusText.FAIL
    );
    return next(error);
  }
  const user = await User.findOne({ email: email });
  if (!user) {
    const error = appError.create(
      "Some Thing Wrong Write the right Email and password",
      400,
      httpStatusText.FAIL
    );
    return next(error);
  }
  const matchedpassword = await bcrypt.compare(password, user.password);

  if (user && matchedpassword) {
    const token= await generateJWT({email:user.email,id:user._id,username:user.username})
    
//////////put token in cookies
    res
      .status(200).cookie("token",token)
      .json({
        status: httpStatusText.SUCCESS,
        code: "200",
        data: { user: {id:user._id,email:user.email,username:user.username} ,token:token},
      });
  } else {
    const error = appError.create(
      "Some Thing Wrong Write the right Email and password",
      500,
      httpStatusText.ERROR
    );
    return next(error);
  }
});


// 
  
  const logout= (req,res)=>{
      return res.cookie('token','').json("ok")
  }

module.exports = { getAllUsers, register, login,logout };
