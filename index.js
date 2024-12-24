const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const process = require("process");
const cors = require("cors");
const AppError = require("./utils/appError");
const logger = require("./middleware/logger");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const favoritesRoutes = require("./routes/favouritesRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const authorRoutes = require("./routes/authorRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const paymentStripeeRoutes = require("./routes/paymentStripeRoutes");
const paymobRoutes = require("./routes/paymobRoutes");
const contactRoutes = require("./routes/contactRoutes");
const adminRoutes = require('./routes/adminStats');
const cardRoutes = require("./routes/cardRoutes");
const { OAuth2Client } = require("google-auth-library");
//make token save in cookies
var cookieParser = require("cookie-parser");
app.use(cookieParser()); 
app.use(cors({
  origin: ["http://localhost:5173", "https://yourfrontenddomain.com"],
  credentials: true // If you're using cookies or authorization headers
}));
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

app.use('/admin', adminRoutes);

app.use("/users", Usersrouter);
app.use("/book", bookRouter);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/favorites", favoritesRoutes);
app.use("/category", categoryRoutes);
app.use("/author", authorRoutes);
app.use("/review", reviewRoutes);
app.use("/stripe", paymentStripeeRoutes);
app.use("/paymob", paymobRoutes);
app.use("/contact", contactRoutes); 
app.use("/card", cardRoutes); 




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
    `${req.method} ${req.url} - ${new Date().toISOString()} - Error: ${
      error.message
    }`
  );

  if (error instanceof AppError) {
    res.status(error.statusCode).json({ message: error.message });
  } else {
    res.status(500).json({ message: "Internal server error" });
  }
  next();
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
