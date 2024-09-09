const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const process = require("process");
const cors = require("cors");
//make token save in cookies
var cookieParser = require('cookie-parser')
app.use(cookieParser())
app.use(cors({credentials:true}))
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


//global middleware for not fond router
app.all("*", (req, res, next) => {
  return res
    .status(404)
    .json({
      status: httpSTatusText.FAIL,
      code: "404",
      message: "This Resourse is not available",
    });
});

// glopal handle error from asyncwrapper middleware
app.use((error, req, res, next) => {
  return res
    .status(error.statusCode || 500)
    .json({
      status: error.statusText || httpSTatusText.ERROR,
      message: error.message,
      code: error.statusCode || 500,
      data: null,
    });
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
