import mongoose from "mongoose";
import GovernmentScheme from "../models/GovernmentScheme.js";

/* -------------------------------------------------------
   GET /api/schemes
------------------------------------------------------- */
export const getSchemes = async (req, res) => {
  try {
    const { category, state, level, search, limit, page } = req.query;
    
    // Build query
    const query = { isActive: true };

    if (category) {
      query.category = category;
    }
    
    if (state) {
      // Allow for Exact match or "All India" for state-specific searches
      query.$or = [
        { state: new RegExp(`^${state}$`, 'i') },
        { state: "All India" }
      ];
    }
    
    if (level) {
      query.level = level;
    }

    // Text search if provided
    if (search) {
      query.$text = { $search: search };
    }

    // Pagination
    const limitNum = parseInt(limit, 10) || 50;
    const pageNum = parseInt(page, 10) || 1;
    const skip = (pageNum - 1) * limitNum;

    // Sorting: Use text score if searching, otherwise sort by latest
    const sort = search ? { score: { $meta: "textScore" } } : { createdAt: -1 };

    // Execute query
    const schemes = await GovernmentScheme.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const total = await GovernmentScheme.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: schemes.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: schemes,
    });
  } catch (error) {
    console.error("Get Schemes Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch government schemes",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/* -------------------------------------------------------
   GET /api/schemes/filters
------------------------------------------------------- */
export const getSchemeFilters = async (req, res) => {
  try {
    // Get unique categories, states, and levels for the frontend dropdowns
    const categories = await GovernmentScheme.distinct("category", { isActive: true });
    const states = await GovernmentScheme.distinct("state", { isActive: true });
    const levels = await GovernmentScheme.distinct("level", { isActive: true });

    return res.status(200).json({
      success: true,
      data: {
        categories,
        states,
        levels,
      },
    });
  } catch (error) {
    console.error("Get Scheme Filters Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch scheme filters",
    });
  }
};

/* -------------------------------------------------------
   GET /api/schemes/:id
------------------------------------------------------- */
export const getSchemeById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid scheme ID",
      });
    }

    const scheme = await GovernmentScheme.findById(id);

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: "Scheme not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: scheme,
    });
  } catch (error) {
    console.error("Get Scheme By ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch scheme details",
    });
  }
};
