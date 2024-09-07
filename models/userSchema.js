const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: tru,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },

  role: {
    type: String,
  },
});

export default mongoose.model("User", userSchema);