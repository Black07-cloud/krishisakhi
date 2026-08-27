import mongoose from "mongoose";

import Crop from "../models/Crop.js";
import Farm from "../models/Farm.js";

import generateCropTasks, {
  getCropLifecycleSummary,
} from "../services/cropAutomationService.js";

// ======================================================
// VALID CROP STAGES
// ======================================================

const VALID_STAGES = [
  "seed",
  "germination",
  "vegetative",
  "flowering",
  "fruiting",
  "maturity",
  "harvest",
];

// ======================================================
// CREATE CROP
// ======================================================

export const createCrop = async (req, res) => {
  try {
    const {
      farm,
      name,
      variety,
      area,
      plantingDate,
      expectedHarvestDate,
      currentStage,
    } = req.body;

    // Validate farm ID
    if (!farm || !mongoose.Types.ObjectId.isValid(farm)) {
      return res.status(400).json({
        success: false,
        message: "Valid farm ID is required",
      });
    }

    // Validate farm ownership
    const existingFarm = await Farm.findOne({
      _id: farm,
      owner: req.user.userId,
      isActive: true,
    });

    if (!existingFarm) {
      return res.status(404).json({
        success: false,
        message: "Farm not found",
      });
    }

    // Validate name
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Crop name is required",
      });
    }

    // Validate area
    if (!area || typeof area.value !== "number" || area.value <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid crop area is required",
      });
    }

    // Validate planting date
    if (!plantingDate) {
      return res.status(400).json({
        success: false,
        message: "Planting date is required",
      });
    }

    const planting = new Date(plantingDate);

    if (Number.isNaN(planting.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid planting date",
      });
    }

    // Validate expected harvest date
    let harvest = null;

    if (expectedHarvestDate) {
      harvest = new Date(expectedHarvestDate);

      if (Number.isNaN(harvest.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid expected harvest date",
        });
      }

      if (harvest <= planting) {
        return res.status(400).json({
          success: false,
          message: "Expected harvest date must be after planting date",
        });
      }
    }

    // Validate stage
    const stage = currentStage || "seed";

    if (!VALID_STAGES.includes(stage)) {
      return res.status(400).json({
        success: false,
        message: `Invalid crop stage. Allowed stages: ${VALID_STAGES.join(
          ", ",
        )}`,
      });
    }

    // Create crop
    const crop = await Crop.create({
      farm,
      owner: req.user.userId,
      name: name.trim(),
      variety: variety?.trim(),
      area,
      plantingDate: planting,
      expectedHarvestDate: harvest,
      currentStage: stage,

      lifecycleHistory: [
        {
          stage,
          changedAt: new Date(),
          note: "Crop created",
        },
      ],
    });

    // Generate first-stage automation tasks
    const automatedTasks = await generateCropTasks({
      crop,
      ownerId: req.user.userId,
    });

    return res.status(201).json({
      success: true,
      message: "Crop created successfully",
      data: {
        crop,
        automatedTasks,
      },
    });
  } catch (error) {
    console.error("Create Crop Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create crop",
    });
  }
};

// ======================================================
// GET MY CROPS
// ======================================================

export const getMyCrops = async (req, res) => {
  try {
    const crops = await Crop.find({
      owner: req.user.userId,
    })
      .populate("farm", "name location")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: crops.length,
      data: crops,
    });
  } catch (error) {
    console.error("Get Crops Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch crops",
    });
  }
};

// ======================================================
// GET CROPS BY FARM
// ======================================================

export const getCropsByFarm = async (req, res) => {
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

    const crops = await Crop.find({
      farm: farm._id,
      owner: req.user.userId,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: crops.length,
      data: crops,
    });
  } catch (error) {
    console.error("Get Farm Crops Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch farm crops",
    });
  }
};

// ======================================================
// GET CROP BY ID
// ======================================================

export const getCropById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid crop ID",
      });
    }

    const crop = await Crop.findOne({
      _id: id,
      owner: req.user.userId,
    }).populate("farm", "name location");

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: "Crop not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: crop,
    });
  } catch (error) {
    console.error("Get Crop Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch crop",
    });
  }
};

// ======================================================
// UPDATE CROP
// ======================================================

export const updateCrop = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid crop ID",
      });
    }

    // Lifecycle fields cannot be updated here
    const {
      currentStage,
      lifecycleHistory,
      status,
      owner,
      farm,
      ...updateData
    } = req.body;

    const crop = await Crop.findOneAndUpdate(
      {
        _id: id,
        owner: req.user.userId,
      },
      updateData,
      {
        new: true,
        runValidators: true,
      },
    ).populate("farm", "name location");

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: "Crop not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Crop updated successfully",
      data: crop,
    });
  } catch (error) {
    console.error("Update Crop Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update crop",
    });
  }
};

// ======================================================
// DELETE CROP
// ======================================================

export const deleteCrop = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid crop ID",
      });
    }

    const crop = await Crop.findOneAndDelete({
      _id: id,
      owner: req.user.userId,
    });

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: "Crop not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Crop deleted successfully",
    });
  } catch (error) {
    console.error("Delete Crop Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete crop",
    });
  }
};

// ======================================================
// UPDATE CROP STAGE
// ======================================================

export const updateCropStage = async (req, res) => {
  try {
    const { id } = req.params;

    const { stage, note } = req.body;

    // Validate crop ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid crop ID",
      });
    }

    // Validate stage
    if (!stage || !VALID_STAGES.includes(stage)) {
      return res.status(400).json({
        success: false,
        message: `Invalid stage. Allowed stages: ${VALID_STAGES.join(", ")}`,
      });
    }

    // Find crop
    const crop = await Crop.findOne({
      _id: id,
      owner: req.user.userId,
    });

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: "Crop not found",
      });
    }

    // Prevent same-stage update
    if (crop.currentStage === stage) {
      return res.status(400).json({
        success: false,
        message: `Crop is already in ${stage} stage`,
      });
    }

    const previousStage = crop.currentStage;

    // Update stage
    crop.currentStage = stage;

    // Mark harvested
    if (stage === "harvest") {
      crop.status = "harvested";
    }

    // Add lifecycle history
    crop.lifecycleHistory.push({
      stage,
      changedAt: new Date(),
      note: note?.trim() || `Stage changed from ${previousStage} to ${stage}`,
    });

    await crop.save();

    // Generate automation tasks
    const automatedTasks = await generateCropTasks({
      crop,
      ownerId: req.user.userId,
    });

    return res.status(200).json({
      success: true,
      message: "Crop stage updated successfully",

      data: {
        cropId: crop._id,
        cropName: crop.name,
        previousStage,
        currentStage: crop.currentStage,
        status: crop.status,
        lifecycleHistory: crop.lifecycleHistory,
        automatedTasks,
      },
    });
  } catch (error) {
    console.error("Update Crop Stage Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update crop stage",
    });
  }
};

// ======================================================
// GET CROP LIFECYCLE
// ======================================================

export const getCropLifecycle = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid crop ID",
      });
    }

    const crop = await Crop.findOne({
      _id: id,
      owner: req.user.userId,
    }).select(
      "name variety currentStage lifecycleHistory status plantingDate expectedHarvestDate farm",
    );

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: "Crop not found",
      });
    }

    // Get lifecycle summary
    const lifecycleSummary = await getCropLifecycleSummary({
      crop,
      ownerId: req.user.userId,
    });

    return res.status(200).json({
      success: true,

      data: {
        cropId: crop._id,
        name: crop.name,
        variety: crop.variety,
        currentStage: crop.currentStage,
        status: crop.status,

        plantingDate: crop.plantingDate,

        expectedHarvestDate: crop.expectedHarvestDate,

        lifecycleHistory: crop.lifecycleHistory,

        progress: {
          daysSincePlanting: lifecycleSummary.daysSincePlanting,

          estimatedDaysRemaining: lifecycleSummary.estimatedDaysRemaining,

          percentage: lifecycleSummary.lifecycleProgressPercentage,
        },

        tasks: {
          pending: lifecycleSummary.pendingTasks,

          completed: lifecycleSummary.completedTasks,
        },
      },
    });
  } catch (error) {
    console.error("Get Crop Lifecycle Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch crop lifecycle",
    });
  }
};
