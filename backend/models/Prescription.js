import mongoose from "mongoose";

const eyeSchema = new mongoose.Schema({
  sph: String,
  cyl: String,
  axis: String,
  dv: String,
  nv: String,
  add: String,
});

const prescriptionSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    rightEye: eyeSchema,
    leftEye: eyeSchema,

    pd: {
      pd_rl: String,
      pd_r: String,
      pd_l: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Prescription", prescriptionSchema);
