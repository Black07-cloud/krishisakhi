import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import DiseaseScan from "../models/DiseaseScan.js";
import Farm from "../models/Farm.js";
import Crop from "../models/Crop.js";

/* -------------------------------------------------------
   POST /api/disease/scans
------------------------------------------------------- */
export const createDiseaseScan = async (req, res) => {
  try {
    const { farm: farmId, crop: cropId, notes, source } = req.body;
    const userId = req.user.userId;

    // Validate image presence
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }

    // Validate object IDs
    if (!mongoose.Types.ObjectId.isValid(farmId) || !mongoose.Types.ObjectId.isValid(cropId)) {
      return res.status(400).json({ success: false, message: "Invalid farm or crop ID" });
    }

    // Verify farm ownership
    const farm = await Farm.findOne({ _id: farmId, owner: userId });
    if (!farm) {
      return res.status(403).json({ success: false, message: "Farm not found or access denied" });
    }

    // Verify crop ownership and farm association
    const crop = await Crop.findOne({ _id: cropId, farm: farmId, owner: userId });
    if (!crop) {
      return res.status(403).json({ success: false, message: "Crop not found or access denied" });
    }

    const newScan = await DiseaseScan.create({
      owner: userId,
      farm: farmId,
      crop: cropId,
      image: req.file.originalname,
      imageUrl: req.file.path,
      imagePublicId: req.file.filename,
      notes: notes || "",
      source: source || "ai",
      status: "pending",
      severity: "unknown"
    });

    return res.status(201).json({
      success: true,
      message: "Disease scan created successfully",
      data: newScan
    });
  } catch (error) {
    console.error("Create Disease Scan Error:", error);
    return res.status(500).json({ success: false, message: "Failed to create disease scan" });
  }
};

/* -------------------------------------------------------
   GET /api/disease/scans
------------------------------------------------------- */
export const getDiseaseScans = async (req, res) => {
  try {
    const { farm, crop, status, limit, page } = req.query;
    const userId = req.user.userId;

    const query = { owner: userId };

    if (farm) query.farm = farm;
    if (crop) query.crop = crop;
    if (status) query.status = status;

    const limitNum = parseInt(limit, 10) || 20;
    const pageNum = parseInt(page, 10) || 1;
    const skip = (pageNum - 1) * limitNum;

    const scans = await DiseaseScan.find(query)
      .sort({ scannedAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("farm", "name")
      .populate("crop", "name type");

    const total = await DiseaseScan.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: scans.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: scans
    });
  } catch (error) {
    console.error("Get Disease Scans Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch disease scans" });
  }
};

/* -------------------------------------------------------
   GET /api/disease/scans/latest
------------------------------------------------------- */
export const getLatestDiseaseScan = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { farm, crop } = req.query;

    const query = { owner: userId };
    if (farm) query.farm = farm;
    if (crop) query.crop = crop;

    const scan = await DiseaseScan.findOne(query)
      .sort({ scannedAt: -1 })
      .populate("farm", "name")
      .populate("crop", "name type");

    if (!scan) {
      return res.status(404).json({ success: false, message: "No disease scan found" });
    }

    return res.status(200).json({
      success: true,
      data: scan
    });
  } catch (error) {
    console.error("Get Latest Disease Scan Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch latest disease scan" });
  }
};

/* -------------------------------------------------------
   GET /api/disease/scans/:id
------------------------------------------------------- */
export const getDiseaseScanById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid scan ID" });
    }

    const scan = await DiseaseScan.findOne({ _id: id, owner: userId })
      .populate("farm", "name")
      .populate("crop", "name type");

    if (!scan) {
      return res.status(404).json({ success: false, message: "Disease scan not found or access denied" });
    }

    return res.status(200).json({
      success: true,
      data: scan
    });
  } catch (error) {
    console.error("Get Disease Scan By ID Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch disease scan details" });
  }
};

/* -------------------------------------------------------
   PATCH /api/disease/scans/:id/result
------------------------------------------------------- */
export const updateDiseaseResult = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const {
      detectedDisease,
      confidence,
      severity,
      symptoms,
      treatment,
      organicTreatment,
      prevention
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid scan ID" });
    }

    // Validate confidence
    if (confidence !== undefined && (confidence < 0 || confidence > 1)) {
      return res.status(400).json({ success: false, message: "Confidence must be between 0 and 1" });
    }

    // Validate severity
    const validSeverities = ["healthy", "mild", "moderate", "severe", "unknown"];
    if (severity && !validSeverities.includes(severity)) {
      return res.status(400).json({ success: false, message: "Invalid severity level" });
    }

    const scan = await DiseaseScan.findOne({ _id: id, owner: userId });

    if (!scan) {
      return res.status(404).json({ success: false, message: "Disease scan not found or access denied" });
    }

    // Update fields
    scan.detectedDisease = detectedDisease !== undefined ? detectedDisease : scan.detectedDisease;
    scan.confidence = confidence !== undefined ? confidence : scan.confidence;
    scan.severity = severity || scan.severity;
    scan.symptoms = symptoms || scan.symptoms;
    scan.treatment = treatment || scan.treatment;
    scan.organicTreatment = organicTreatment || scan.organicTreatment;
    scan.prevention = prevention || scan.prevention;
    scan.status = "analyzed"; // Mark as analyzed since results are being pushed

    await scan.save();

    // FUTURE: Trigger automated FarmTask creation here if severity is moderate/severe

    return res.status(200).json({
      success: true,
      message: "Disease scan result updated successfully",
      data: scan
    });
  } catch (error) {
    console.error("Update Disease Result Error:", error);
    return res.status(500).json({ success: false, message: "Failed to update disease result" });
  }
};

/* -------------------------------------------------------
   DELETE /api/disease/scans/:id
------------------------------------------------------- */
export const deleteDiseaseScan = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid scan ID" });
    }

    const scan = await DiseaseScan.findOne({ _id: id, owner: userId });

    if (!scan) {
      return res.status(404).json({ success: false, message: "Disease scan not found or access denied" });
    }

    // Delete image from Cloudinary
    if (scan.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(scan.imagePublicId);
      } catch (cloudErr) {
        console.error("Failed to delete image from Cloudinary:", cloudErr);
        // Continue with DB deletion even if cloud deletion fails
      }
    }

    await DiseaseScan.deleteOne({ _id: id });

    return res.status(200).json({
      success: true,
      message: "Disease scan deleted successfully"
    });
  } catch (error) {
    console.error("Delete Disease Scan Error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete disease scan" });
  }
};
