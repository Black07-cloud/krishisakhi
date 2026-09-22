import mongoose from "mongoose";
import SoilRecord from "../models/SoilRecord.js";
import Farm from "../models/Farm.js";
import { getFarmSoilIntelligence } from "../services/soilIntelligenceService.js";

const allowedSoilFields = [
  "ph",
  "nitrogen",
  "phosphorus",
  "potassium",
  "organicCarbon",
  "micronutrients",
  "testedAt",
  "notes",
];

const validateSoilPayload = (payload) => {
  const {
    ph,
    nitrogen,
    phosphorus,
    potassium,
    organicCarbon,
    micronutrients,
    notes,
  } = payload;

  if (
    ph !== undefined &&
    (Number.isNaN(Number(ph)) || Number(ph) < 0 || Number(ph) > 14)
  ) {
    return "pH must be a number between 0 and 14";
  }

  if (
    nitrogen !== undefined &&
    (Number.isNaN(Number(nitrogen)) || Number(nitrogen) < 0)
  ) {
    return "Nitrogen must be a valid non-negative number";
  }

  if (
    phosphorus !== undefined &&
    (Number.isNaN(Number(phosphorus)) || Number(phosphorus) < 0)
  ) {
    return "Phosphorus must be a valid non-negative number";
  }

  if (
    potassium !== undefined &&
    (Number.isNaN(Number(potassium)) || Number(potassium) < 0)
  ) {
    return "Potassium must be a valid non-negative number";
  }

  if (
    organicCarbon !== undefined &&
    (Number.isNaN(Number(organicCarbon)) || Number(organicCarbon) < 0)
  ) {
    return "Organic carbon must be a valid non-negative number";
  }

  if (micronutrients) {
    const micronutrientList = ["zinc", "iron", "manganese", "copper", "boron"];
    for (const key of micronutrientList) {
      if (
        micronutrients[key] !== undefined &&
        (Number.isNaN(Number(micronutrients[key])) ||
          Number(micronutrients[key]) < 0)
      ) {
        return `${key} must be a valid non-negative number`;
      }
    }
  }

  if (notes !== undefined && typeof notes !== "string") {
    return "Notes must be a string";
  }

  return null;
};

export const createSoilRecord = async (req, res) => {
  try {
    const {
      farm,
      ph,
      nitrogen,
      phosphorus,
      potassium,
      organicCarbon,
      micronutrients,
      notes,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(farm)) {
      return res.status(400).json({
        success: false,
        message: "Invalid farm ID",
      });
    }

    const validationMessage = validateSoilPayload({
      ph,
      nitrogen,
      phosphorus,
      potassium,
      organicCarbon,
      micronutrients,
      notes,
    });

    if (validationMessage) {
      return res.status(400).json({
        success: false,
        message: validationMessage,
      });
    }

    const farmExists = await Farm.findOne({
      _id: farm,
      owner: req.user.userId,
      isActive: true,
    });

    if (!farmExists) {
      return res.status(404).json({
        success: false,
        message: "Farm not found",
      });
    }

    const soilRecord = await SoilRecord.create({
      farm,
      owner: req.user.userId,
      ph,
      nitrogen,
      phosphorus,
      potassium,
      organicCarbon,
      micronutrients,
      notes: notes?.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Soil record created successfully",
      data: soilRecord,
    });
  } catch (error) {
    console.error("Create Soil Record Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create soil record",
    });
  }
};

export const getSoilRecordById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid soil record ID",
      });
    }

    const record = await SoilRecord.findOne({
      _id: id,
      owner: req.user.userId,
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Soil record not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error("Get Soil Record Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch soil record",
    });
  }
};

export const getLatestSoilRecord = async (req, res) => {
  try {
    const { farmId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(farmId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid farm ID",
      });
    }

    const farm = await Farm.findOne({
      _id: farmId,
      owner: req.user.userId,
      isActive: true,
    });

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: "Farm not found",
      });
    }

    const record = await SoilRecord.findOne({
      farm: farmId,
      owner: req.user.userId,
    }).sort({ testedAt: -1 });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "No soil record found",
      });
    }

    return res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error("Get Latest Soil Record Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch latest soil record",
    });
  }
};

export const getSoilHistory = async (req, res) => {
  try {
    const { farmId } = req.params;
    const requestedLimit = Number(req.query.limit ?? 20);

    if (!mongoose.Types.ObjectId.isValid(farmId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid farm ID",
      });
    }

    const farm = await Farm.findOne({
      _id: farmId,
      owner: req.user.userId,
      isActive: true,
    });

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: "Farm not found",
      });
    }

    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 100)
      : 20;

    const records = await SoilRecord.find({
      farm: farmId,
      owner: req.user.userId,
    })
      .sort({ testedAt: -1 })
      .limit(limit);

    return res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    console.error("Get Soil History Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch soil history",
    });
  }
};

export const updateSoilRecord = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid soil record ID",
      });
    }

    const updateData = { ...req.body };
    const forbiddenFields = ["owner", "farm"];

    for (const field of forbiddenFields) {
      if (field in updateData) {
        delete updateData[field];
      }
    }

    const invalidKeys = Object.keys(updateData).filter(
      (field) => !allowedSoilFields.includes(field),
    );

    if (invalidKeys.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid soil update fields: ${invalidKeys.join(", ")}`,
      });
    }

    const validationMessage = validateSoilPayload(updateData);

    if (validationMessage) {
      return res.status(400).json({
        success: false,
        message: validationMessage,
      });
    }

    if (
      updateData.notes !== undefined &&
      typeof updateData.notes === "string"
    ) {
      updateData.notes = updateData.notes.trim();
    }

    const record = await SoilRecord.findOneAndUpdate(
      {
        _id: id,
        owner: req.user.userId,
      },
      updateData,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Soil record not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Soil record updated successfully",
      data: record,
    });
  } catch (error) {
    console.error("Update Soil Record Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update soil record",
    });
  }
};

export const deleteSoilRecord = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid soil record ID",
      });
    }

    const record = await SoilRecord.findOneAndDelete({
      _id: id,
      owner: req.user.userId,
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Soil record not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Soil record deleted successfully",
    });
  } catch (error) {
    console.error("Delete Soil Record Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete soil record",
    });
  }
};

export const getSoilIntelligence = async (req, res) => {
  try {
    const { farmId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(farmId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid farm ID",
      });
    }

    const intelligence = await getFarmSoilIntelligence(farmId, req.user.userId);

    if (!intelligence) {
      return res.status(404).json({
        success: false,
        message: "No soil record found for this farm",
      });
    }

    return res.status(200).json({
      success: true,
      data: intelligence,
    });
  } catch (error) {
    console.error("Get Soil Intelligence Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate soil intelligence summary",
    });
  }
};
