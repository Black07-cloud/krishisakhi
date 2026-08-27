import mongoose from "mongoose";
import {
  getFarmDashboardData,
  getOwnedActiveFarm,
  getUserDashboardData,
} from "../services/dashboardService.js";

export const getDashboard = async (req, res) => {
  try {
    const data = await getUserDashboardData(req.user.userId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get Dashboard Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard",
    });
  }
};

export const getFarmDashboard = async (req, res) => {
  try {
    const { farmId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(farmId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid farm ID",
      });
    }

    const farm = await getOwnedActiveFarm(farmId, req.user.userId);

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: "Farm not found",
      });
    }

    const data = await getFarmDashboardData(farm, req.user.userId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get Farm Dashboard Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard",
    });
  }
};
