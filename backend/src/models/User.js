import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    phone: {
      type: String,
      trim: true,
    },

    role: {
      type: String,
      enum: ["farmer", "admin"],
      default: "farmer",
    },

    language: {
      type: String,
      enum: ["ta", "en", "ml"],
      default: "ta",
    },

    location: {
      state: {
        type: String,
        trim: true,
      },
      district: {
        type: String,
        trim: true,
      },
      village: {
        type: String,
        trim: true,
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

export default User;
