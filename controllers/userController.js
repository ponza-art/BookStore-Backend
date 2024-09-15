
const User = require("../models/userSchema");
const AppError = require("../utils/appError");
const generateJWT = require("../utils/generateJWT");
const httpStatusText = require("../utils/httpStatusText");
const bcrypt = require("bcryptjs");

const getAllUsers = async (req, res, next) => {
  try {
    const Users = await User.find({}, { __v: 0, password: 0 });
    res
      .status(200)
      .json({ status: httpStatusText.SUCCESS, code: "200", data: { Users } });
  } catch (error) {
    next(new AppError("Failed to fetch users", 500));
  }
};

const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const oldUser = await User.findOne({ email: email });
    if (oldUser) {
      return next(new AppError("Invalid Email", 400));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });
    
  
    await newUser.save();
    res.status(201).json({
      status: httpStatusText.SUCCESS,
      code: "200",
      data: { user: newUser },
    });
    
  } catch (error) {
    return next(new AppError("Registration failed", 500));
  }
};

//login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email && !password) {
      return next(new AppError("Email and password are required", 400));
    }
    const user = await User.findOne({ email: email });
    if (!user) {
      return next(new AppError("Incorrect Email or Password", 400));
    }
    if (user.email == process.env.ADMIN_EMAIL) {
      user.isAdmin = true;
    }
    const matchedpassword = await bcrypt.compare(password, user.password);
    if (user && matchedpassword) {
      const token = await generateJWT({
        email: user.email,
        id: user._id,
        username: user.username,
      });


      res.status(200).json({
        status: httpStatusText.SUCCESS,
        code: "200",
        data: {
          user: { id: user._id, email: user.email, username: user.username,token },
        },
      });
    } else {
      return next(new AppError("Incorrect Email or Password", 500));
    }
   
  } catch (error) {
    return next(new AppError("Login failed", 500));
  }
};

const createAdmin = async (req, res, next) => {
  const { username, email, password } = req.body; // Remove isAdmin from destructuring
  const oldUser = await User.findOne({ email });
  
  if (oldUser) {
    const error = appError.create("Invalid Email", 400, httpStatusText.FAIL);
    return next(error);
  }
  
  if (!username || !email || !password) {
    const error = appError.create(
      "Data is incorrect. Please check all fields and try again.",
      402,
      httpStatusText.FAIL
    );
    return next(error);
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    isAdmin: true, // Force isAdmin to be true for this function
  });
  
  await newUser.save();
  
  res.status(201).json({
    status: httpStatusText.SUCCESS,
    code: "200",
    data: { user: newUser },
  });
};


//

// const logout = (req, res) => {
//   return res.cookie("token", "").json("ok");
// };

module.exports = { getAllUsers, register, login,createAdmin};
