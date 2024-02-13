const mongoose = require("mongoose");
const { Schema } = mongoose;

const PlaceSchema = new Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  photos: [String],
  description: { type: String, required: true },
  perks: [String],
  extraInfo: { type: String, required: true },
  checkIn: { type: Number, required: true },
  checkOut: { type: Number, required: true },
  maxGuests: { type: Number, required: true },
  price: { type: Number },
});

const PlaceModel = mongoose.model("Place", PlaceSchema);
module.exports = PlaceModel;
