import mongoose from "mongoose";

const farmSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    area: {
      value: {
        type: Number,
        required: true,
        min: 0,
      },
      unit: {
        type: String,
        enum: ["acre", "hectare", "cent"],
        default: "acre",
      },
    },

    location: {
      state: String,
      district: String,
      village: String,

      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },

    soilType: {
      type: String,
      enum: [
        "clay",
        "sandy",
        "loamy",
        "silty",
        "black",
        "red",
        "alluvial",
        "other",
      ],
      default: "other",
    },

    irrigationType: {
      type: String,
      enum: [
        "rainfed",
        "drip",
        "sprinkler",
        "canal",
        "borewell",
        "other",
      ],
      default: "rainfed",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Farm = mongoose.model("Farm", farmSchema);

export default Farm;