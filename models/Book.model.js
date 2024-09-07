const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  sourcePath: {
    type: String,
    required: true,
  },
});

export default mongoose.model("Book", bookSchema);
