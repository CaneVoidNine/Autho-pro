import mongoose from "mongoose";
const { Schema, model } = mongoose;

const accomodationsSchema = new Schema(
  {
    name: { type: String, required: true },
    city: { type: String, required: true },
    user: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    description: { type: String, required: false },
    numberOfGuests: { type: Number, required: true },
  },
  { timestamps: true }
);

export default model("Accomodations", accomodationsSchema);
