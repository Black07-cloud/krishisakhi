import mongoose from "mongoose";

const soilRecordSchema = new mongoose.Schema(
  {
    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
      required: true,
      index: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    testedAt: {
      type: Date,
      default: Date.now,
    },

    ph: {
      type: Number,
      min: 0,
      max: 14,
    },

    nitrogen: {
      type: Number,
      min: 0,
    },

    phosphorus: {
      type: Number,
      min: 0,
    },

    potassium: {
      type: Number,
      min: 0,
    },

    organicCarbon: {
      type: Number,
      min: 0,
    },

    micronutrients: {
      zinc: Number,
      iron: Number,
      manganese: Number,
      copper: Number,
      boron: Number,
    },

    source: {
      type: String,
      enum: ["manual", "lab", "sensor", "ai"],
      default: "manual",
    },

    notes: {
      type: String,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

const SoilRecord = mongoose.model(
  "SoilRecord",
  soilRecordSchema
);

export default SoilRecord;