const User = require("../models/userSchema");
const UserGoogle = require("../models/userGoogleSchema");
const AppError = require("../utils/appError");
const generateJWT = require("../utils/generateJWT");
const httpStatusText = require("../utils/httpStatusText");
const bcrypt = require("bcryptjs");
const { oauth2Client } = require("../config/googleConfig");
const axios = require("axios");
const { userUpdateSchemaJoi } = require("../validators/userValidate");  


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
      user.isAdmin = true;
    }
    const matchedpassword = await bcrypt.compare(password, user.password);
    if (user && matchedpassword) {
      const token = await generateJWT({
        email: user.email,
        id: user._id,
        username: user.username,
        status: user.status || false,

      });

      res.status(200).json({
        status: httpStatusText.SUCCESS,
        code: "200",
        data: {
          user: {
            id: user._id,
            email: user.email,
            username: user.username,
            token,
            status: user.status || false,
            isAdmin: user.isAdmin,
          },
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
  const { username, email, password } = req.body; 
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
    isAdmin: true, 
  });

  await newUser.save();

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    code: "200",
    data: { user: newUser },
  });
};

const googleLogin = async (req, res, next) => {
  try {
    const { code } = req.query;

    if (!code) {
      return next(new AppError("Authorization code is missing", 400));
    }

    const googleRes = await oauth2Client.getToken(code);
    if (!googleRes.tokens) {
      return next(new AppError("Failed to retrieve tokens", 500));
    }

    oauth2Client.setCredentials(googleRes.tokens);

    const userRes = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
    );

    if (userRes.status !== 200) {
      return next(new AppError("Failed to retrieve user info", 500));
    }

    const { email, name, picture } = userRes.data;

    let user = await UserGoogle.findOne({ email });
    if (!user) {
      user = await UserGoogle.create({
        name,
        email,
        image: picture,
      });
    }

    const userWithId = {
      id: user._id,
      name: user.name,
      email: user.email,
      image: user.image,
    };

    const token = await generateJWT({ id: userWithId.id, email });

    res.status(200).json({
      status: httpStatusText.SUCCESS,
      code: "200",
      user: userWithId,
      token,
    });
  } catch (error) {
    return next(new AppError("Login With Google failed", 500));
  }
};

//

// const logout = (req, res) => {
//   return res.cookie("token", "").json("ok");
// };

const editUserStatus = async (req, res, next) => {
  try {
    const { userId, status } = req.body;

    if (![true, false].includes(status)) {
      return next(new AppError("Invalid status", 400));
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true }
    );

    if (!updatedUser) {
      return next(new AppError("User not found", 404));
    }

    res.status(200).json({
      status: httpStatusText.SUCCESS,
      code: "200",
      data: { user: updatedUser },
    });
  } catch (error) {
    return next(new AppError("Failed to update user status", 500));
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { username, email } = req.body;

    const { error } = userUpdateSchemaJoi.validate({ username, email });
    if (error) {
      return next(new AppError(`Validation error: ${error.details[0].message}`, 400));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser._id.toString() !== userId) {
      return next(new AppError("Email already in use by another user", 400));
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username, email },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return next(new AppError("User not found", 404));
    }

    res.status(200).json({
      status: httpStatusText.SUCCESS,
      code: "200",
      data: { user: updatedUser },
    });
  } catch (error) {
    return next(new AppError("Profile update failed", 500));
  }
};




const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;  

    const user = await User.findById(userId, { password: 0, __v: 0 });

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    res.status(200).json({
      status: httpStatusText.SUCCESS,
      code: "200",
      data: { user },
    });
  } catch (error) {
    return next(new AppError("Failed to retrieve user data", 500));
  }
};

module.exports = { getAllUsers, register, login, createAdmin, googleLogin, editUserStatus, updateProfile,getUserProfile };



