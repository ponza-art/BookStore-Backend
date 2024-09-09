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
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
   

  role: {
    type: String,
    
  },
 
},{
  toJSON: {
    transform(doc, ret) {
      delete ret.password;
    },
  },
}
);

module.exports= mongoose.model("User", userSchema);