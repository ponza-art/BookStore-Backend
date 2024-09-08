const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const process = require("process");
const bookRouter = require("./routes/bookRoutes");
require("dotenv").config();
const port = process.env.PORT;
const url = process.env.URL;

mongoose
  .connect(url)
  .then(() => {
    console.log("mongo connection started");
  })
  .catch((err) => {
    console.log("mongo connection drop");
  });

// parse application/x-www-form-urlencoded

app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(express.json());

app.get("/", (req, res) => {
  return res.json("hello");
});

app.use("/book", bookRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
