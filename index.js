const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require('cookie-parser');
require("dotenv").config();

const port = process.env.PORT;
const url = process.env.URL;

const bookRouter = require("./routes/bookRoutes");
const Usersrouter = require("./routes/userRoutes");
const httpStatusText = require("./utils/httpStatusText");

// Middlewares
app.use(cors({ credentials: true }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Mongoose connection
mongoose
  .connect(url)
  .then(() => console.log("MongoDB connection started"))
  .catch((err) => console.log("MongoDB connection failed:", err));

// Routes
app.use("/users", Usersrouter);
app.use("/book", bookRouter);

// Global middleware for non-existing routes
app.all("*", (req, res) => {
  return res.status(404).json({
    status: httpStatusText.FAIL,
    code: "404",
    message: "This Resource is not available",
  });
});

// Global error handler
app.use((error, req, res, next) => {
  return res.status(error.statusCode || 500).json({
    status: error.statusText || httpStatusText.ERROR,
    message: error.message,
    code: error.statusCode || 500,
    data: null,
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
