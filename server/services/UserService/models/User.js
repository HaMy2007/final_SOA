const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    role: {
      type: String,
      enum: ["student", "advisor", "admin"],
      required: true,
    },
    isHomeTeacher: { type: boolean },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    phone_number: { type: String, required: true },
    parent_number: { type: String },
    address: { type: String },
    date_of_birth: { type: Date, required: true },
    email: { type: String, required: true, unique: true },
    tdt_id: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("users", UserSchema);
