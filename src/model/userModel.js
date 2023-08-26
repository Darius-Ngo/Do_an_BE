const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  ho_ten: {
    type: String,
    required: true,
  },
  sdt: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  ngay_sinh: {
    type: String,
  },
  gioi_tinh: {
    type: [String],
  },
  dia_chi: {
    type: [String],
  },
  avatar: {
    type: [String],
  },
  // author: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Author",
  // },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
