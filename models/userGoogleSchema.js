const mongoose = require("mongoose");
const userGoogleSchema = new mongoose.Schema({
 username: {
    type: String,
  },
  email: {
    type: String,
  },

  image: {
    type: String,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  status: {
    type: Boolean,
    enum: [true, false],
    default: true,
  },
});

module.exports = mongoose.model("UserGoogle", userGoogleSchema);
