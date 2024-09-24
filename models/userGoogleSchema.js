const mongoose = require("mongoose");
const userGoogleSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
  },

  image: {
    type: String,
  },
});

module.exports = mongoose.model("UserGoogle", userGoogleSchema);
