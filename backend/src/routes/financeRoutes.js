import express from "express";
import {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getFinanceSummary,
  getFarmFinance,
  getCropFinance,
} from "../controllers/financeController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Require authentication for all finance routes
router.use(protect);

// Financial summary endpoint (must be defined before /:id)
router.get("/summary", getFinanceSummary);

// Farm-specific & Crop-specific endpoints
router.get("/farm/:farmId", getFarmFinance);
router.get("/crop/:cropId", getCropFinance);

// Transaction CRUD endpoints
router.post("/transactions", createTransaction);
router.get("/transactions", getTransactions);
router.get("/transactions/:id", getTransactionById);
router.put("/transactions/:id", updateTransaction);
router.delete("/transactions/:id", deleteTransaction);

export default router;
