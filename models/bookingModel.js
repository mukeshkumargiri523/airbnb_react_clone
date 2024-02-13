const mongoose = require("mongoose");
const { Schema } = mongoose;

const BookingSchema = new Schema({
  place: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Place" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  price: { type: Number, required: true },
  numberOfGuests: { type: Number, required: true },
  name: { type: String, required: true },
});

const BookingModel = mongoose.model("Booking", BookingSchema);
module.exports = BookingModel;
