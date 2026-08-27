import mongoose from "mongoose";

const cropSchema = new mongoose.Schema(
  {
    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
      required: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    variety: {
      type: String,
      trim: true,
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

    plantingDate: {
      type: Date,
      required: true,
    },

    expectedHarvestDate: {
      type: Date,
    },

    currentStage: {
      type: String,
      enum: [
        "seed",
        "germination",
        "vegetative",
        "flowering",
        "fruiting",
        "maturity",
        "harvest",
      ],
      default: "seed",
    },

    lifecycleHistory: [
      {
        stage: {
          type: String,
          enum: [
            "seed",
            "germination",
            "vegetative",
            "flowering",
            "fruiting",
            "maturity",
            "harvest",
          ],
          required: true,
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
        note: {
          type: String,
          default: "Crop stage updated",
        },
      },
    ],

    status: {
      type: String,
      enum: ["active", "harvested", "failed", "cancelled"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const Crop = mongoose.model("Crop", cropSchema);

export default Crop;