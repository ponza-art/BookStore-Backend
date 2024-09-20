const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const process = require("process");
const cors = require("cors");
const AppError = require("./utils/appError");
const logger = require("./middleware/logger")
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const favoritesRoutes = require("./routes/favouritesRoutes");

//make token save in cookies
var cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use(cors({ credentials: true }));

////////////////////////////////
const bookRouter = require("./routes/bookRoutes");
require("dotenv").config();
const port = process.env.PORT;
const url = process.env.URL;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(express.json());

const httpSTatusText = require("./utils/httpStatusText");

//mongoose
mongoose
  .connect(url)
  .then(() => {
    console.log("mongo connection started");
  })
  .catch((err) => {
    console.log("mongo connection drop");
  });

//route
const Usersrouter = require("./routes/userRoutes");

app.use("/users", Usersrouter);
app.use("/book", bookRouter);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/favorites", favoritesRoutes);

//global middleware for not fond router
app.all("*", (req, res, next) => {
  return res.status(404).json({
    status: httpSTatusText.FAIL,
    code: "404",
    message: "This Resourse is not available",
  });
});

// glopal handle error from asyncwrapper middleware
app.use((error, req, res, next) => {
  logger.error(
    `${req.method} ${req.url} - ${new Date().toISOString()} - Error: ${error.message
    }`
  );

  if (error instanceof AppError) {
    res.status(error.statusCode).json({ message: error.message });
  } else {
    res.status(500).json({ message: "Internal server error" });
  }
  next()
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
