const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
  name: { type: String, unique: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, unique: true, required: true },
  userPhone: { type: String, unique: true },
  city: { type: String },
  country: { type: String },
});

const UserModel = mongoose.model("User", UserSchema);
module.exports = UserModel;
