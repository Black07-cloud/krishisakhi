import Farm from "../models/Farm.js";

// CREATE FARM
export const createFarm = async (req, res) => {
  try {
    const farm = await Farm.create({
      ...req.body,
      owner: req.user.userId,
    });

    return res.status(201).json({
      success: true,
      message: "Farm created successfully",
      data: farm,
    });
  } catch (error) {
    console.error("Create Farm Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create farm",
    });
  }
};

// GET MY FARMS
export const getMyFarms = async (req, res) => {
  try {
    const farms = await Farm.find({
      owner: req.user.userId,
      isActive: true,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: farms.length,
      data: farms,
    });
  } catch (error) {
    console.error("Get Farms Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch farms",
    });
  }
};

// GET FARM BY ID
export const getFarmById = async (req, res) => {
  try {
    const farm = await Farm.findOne({
      _id: req.params.id,
      owner: req.user.userId,
      isActive: true,
    });

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: "Farm not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: farm,
    });
  } catch (error) {
    console.error("Get Farm Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch farm",
    });
  }
};

// UPDATE FARM
export const updateFarm = async (req, res) => {
  try {
    const farm = await Farm.findOneAndUpdate(
      {
        _id: req.params.id,
        owner: req.user.userId,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: "Farm not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Farm updated successfully",
      data: farm,
    });
  } catch (error) {
    console.error("Update Farm Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update farm",
    });
  }
};

// DELETE FARM
export const deleteFarm = async (req, res) => {
  try {
    const farm = await Farm.findOneAndUpdate(
      {
        _id: req.params.id,
        owner: req.user.userId,
      },
      {
        isActive: false,
      },
      {
        new: true,
      }
    );

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: "Farm not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Farm deleted successfully",
    });
  } catch (error) {
    console.error("Delete Farm Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete farm",
    });
  }
};