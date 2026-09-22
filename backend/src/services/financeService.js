import mongoose from "mongoose";
import FarmTransaction from "../models/FarmTransaction.js";
import Farm from "../models/Farm.js";
import Crop from "../models/Crop.js";

// Helper to validate Farm and Crop ownership
const validateFarmAndCropOwnership = async (ownerId, farmId, cropId) => {
  if (!mongoose.Types.ObjectId.isValid(farmId)) {
    const error = new Error("Invalid farm ID format");
    error.status = 400;
    throw error;
  }

  const farm = await Farm.findOne({ _id: farmId, owner: ownerId });
  if (!farm) {
    const error = new Error("Farm not found or unauthorized");
    error.status = 404;
    throw error;
  }

  let crop = null;
  if (cropId) {
    if (!mongoose.Types.ObjectId.isValid(cropId)) {
      const error = new Error("Invalid crop ID format");
      error.status = 400;
      throw error;
    }

    crop = await Crop.findOne({ _id: cropId, owner: ownerId });
    if (!crop) {
      const error = new Error("Crop not found or unauthorized");
      error.status = 404;
      throw error;
    }

    if (crop.farm.toString() !== farmId.toString()) {
      const error = new Error("Selected crop does not belong to the selected farm");
      error.status = 400;
      throw error;
    }
  }

  return { farm, crop };
};

export const createTransactionService = async (ownerId, data) => {
  const farmId = data.farmId || data.farm;
  const cropId = data.cropId || data.crop || null;

  await validateFarmAndCropOwnership(ownerId, farmId, cropId);

  const transaction = new FarmTransaction({
    owner: ownerId,
    farm: farmId,
    crop: cropId || undefined,
    type: data.type,
    category: data.category,
    amount: Number(data.amount),
    date: data.date ? new Date(data.date) : new Date(),
    description: data.description,
    paymentMethod: data.paymentMethod || "cash",
    source: data.source || "manual",
    reference: data.reference,
  });

  await transaction.save();
  return await FarmTransaction.findById(transaction._id)
    .populate("farm", "name location")
    .populate("crop", "name variety");
};

export const getTransactionsService = async (ownerId, queryParams = {}) => {
  const {
    farmId,
    cropId,
    type,
    category,
    paymentMethod,
    startDate,
    endDate,
    page = 1,
    limit = 20,
  } = queryParams;

  const filter = { owner: new mongoose.Types.ObjectId(ownerId) };

  if (farmId && mongoose.Types.ObjectId.isValid(farmId)) {
    filter.farm = new mongoose.Types.ObjectId(farmId);
  }

  if (cropId && mongoose.Types.ObjectId.isValid(cropId)) {
    filter.crop = new mongoose.Types.ObjectId(cropId);
  }

  if (type && ["income", "expense"].includes(type)) {
    filter.type = type;
  }

  if (category) {
    filter.category = category;
  }

  if (paymentMethod) {
    filter.paymentMethod = paymentMethod;
  }

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) {
      const start = new Date(startDate);
      if (!isNaN(start.getTime())) filter.date.$gte = start;
    }
    if (endDate) {
      const end = new Date(endDate);
      if (!isNaN(end.getTime())) {
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [transactions, total] = await Promise.all([
    FarmTransaction.find(filter)
      .populate("farm", "name location")
      .populate("crop", "name variety")
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    FarmTransaction.countDocuments(filter),
  ]);

  return {
    transactions,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 0,
    },
  };
};

export const getTransactionByIdService = async (ownerId, transactionId) => {
  if (!mongoose.Types.ObjectId.isValid(transactionId)) {
    const error = new Error("Invalid transaction ID");
    error.status = 400;
    throw error;
  }

  const transaction = await FarmTransaction.findOne({
    _id: transactionId,
    owner: ownerId,
  })
    .populate("farm", "name location")
    .populate("crop", "name variety");

  if (!transaction) {
    const error = new Error("Transaction not found");
    error.status = 404;
    throw error;
  }

  return transaction;
};

export const updateTransactionService = async (ownerId, transactionId, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(transactionId)) {
    const error = new Error("Invalid transaction ID");
    error.status = 400;
    throw error;
  }

  const transaction = await FarmTransaction.findOne({
    _id: transactionId,
    owner: ownerId,
  });

  if (!transaction) {
    const error = new Error("Transaction not found");
    error.status = 404;
    throw error;
  }

  const targetFarmId = updateData.farmId || updateData.farm || transaction.farm;
  const targetCropId = updateData.cropId !== undefined ? updateData.cropId : updateData.crop !== undefined ? updateData.crop : transaction.crop;

  await validateFarmAndCropOwnership(ownerId, targetFarmId, targetCropId);

  if (updateData.farm) transaction.farm = targetFarmId;
  if (updateData.crop !== undefined) transaction.crop = targetCropId;
  if (updateData.type) transaction.type = updateData.type;
  if (updateData.category) transaction.category = updateData.category;
  if (updateData.amount !== undefined) transaction.amount = Number(updateData.amount);
  if (updateData.date) transaction.date = new Date(updateData.date);
  if (updateData.description !== undefined) transaction.description = updateData.description;
  if (updateData.paymentMethod) transaction.paymentMethod = updateData.paymentMethod;
  if (updateData.source) transaction.source = updateData.source;
  if (updateData.reference !== undefined) transaction.reference = updateData.reference;

  await transaction.save();

  return await FarmTransaction.findById(transaction._id)
    .populate("farm", "name location")
    .populate("crop", "name variety");
};

export const deleteTransactionService = async (ownerId, transactionId) => {
  if (!mongoose.Types.ObjectId.isValid(transactionId)) {
    const error = new Error("Invalid transaction ID");
    error.status = 400;
    throw error;
  }

  const transaction = await FarmTransaction.findOneAndDelete({
    _id: transactionId,
    owner: ownerId,
  });

  if (!transaction) {
    const error = new Error("Transaction not found");
    error.status = 404;
    throw error;
  }

  return { success: true };
};

export const getFinanceSummaryService = async (ownerId, queryParams = {}) => {
  const { farmId, cropId, startDate, endDate } = queryParams;

  const filter = { owner: new mongoose.Types.ObjectId(ownerId) };

  if (farmId && mongoose.Types.ObjectId.isValid(farmId)) {
    filter.farm = new mongoose.Types.ObjectId(farmId);
  }

  if (cropId && mongoose.Types.ObjectId.isValid(cropId)) {
    filter.crop = new mongoose.Types.ObjectId(cropId);
  }

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) {
      const start = new Date(startDate);
      if (!isNaN(start.getTime())) filter.date.$gte = start;
    }
    if (endDate) {
      const end = new Date(endDate);
      if (!isNaN(end.getTime())) {
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }
  }

  // Aggregate totals
  const totalStats = await FarmTransaction.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        totalIncome: {
          $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
        },
        totalExpense: {
          $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] },
        },
        transactionCount: { $sum: 1 },
        incomeTransactionCount: {
          $sum: { $cond: [{ $eq: ["$type", "income"] }, 1, 0] },
        },
        expenseTransactionCount: {
          $sum: { $cond: [{ $eq: ["$type", "expense"] }, 1, 0] },
        },
      },
    },
  ]);

  const stats = totalStats[0] || {
    totalIncome: 0,
    totalExpense: 0,
    transactionCount: 0,
    incomeTransactionCount: 0,
    expenseTransactionCount: 0,
  };

  const totalIncome = stats.totalIncome || 0;
  const totalExpense = stats.totalExpense || 0;
  const profit = totalIncome - totalExpense;
  const averageIncome = stats.incomeTransactionCount > 0 ? totalIncome / stats.incomeTransactionCount : 0;
  const averageExpense = stats.expenseTransactionCount > 0 ? totalExpense / stats.expenseTransactionCount : 0;

  // Expense by category breakdown
  const categoryStats = await FarmTransaction.aggregate([
    { $match: { ...filter, type: "expense" } },
    {
      $group: {
        _id: "$category",
        total: { $sum: "$amount" },
      },
    },
    { $sort: { total: -1 } },
  ]);

  const expenseByCategory = {};
  categoryStats.forEach((cat) => {
    expenseByCategory[cat._id] = cat.total;
  });

  // Monthly breakdown
  const monthlyStats = await FarmTransaction.aggregate([
    { $match: filter },
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
        },
        income: {
          $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
        },
        expense: {
          $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] },
        },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const monthlySummary = monthlyStats.map((item) => {
    const monthStr = `${item._id.year}-${String(item._id.month).padStart(2, "0")}`;
    return {
      month: monthStr,
      income: item.income,
      expense: item.expense,
      profit: item.income - item.expense,
    };
  });

  return {
    totalIncome,
    totalExpense,
    profit,
    transactionCount: stats.transactionCount,
    incomeTransactionCount: stats.incomeTransactionCount,
    expenseTransactionCount: stats.expenseTransactionCount,
    averageIncome,
    averageExpense,
    expenseByCategory,
    monthlySummary,
  };
};

export const getFarmFinanceService = async (ownerId, farmId) => {
  if (!mongoose.Types.ObjectId.isValid(farmId)) {
    const error = new Error("Invalid farm ID");
    error.status = 400;
    throw error;
  }

  const farm = await Farm.findOne({ _id: farmId, owner: ownerId });
  if (!farm) {
    const error = new Error("Farm not found");
    error.status = 404;
    throw error;
  }

  const summary = await getFinanceSummaryService(ownerId, { farmId });
  const recentTransactions = await FarmTransaction.find({ owner: ownerId, farm: farmId })
    .populate("crop", "name variety")
    .sort({ date: -1 })
    .limit(10);

  return {
    farm: {
      _id: farm._id,
      name: farm.name,
      area: farm.area,
      location: farm.location,
    },
    summary,
    transactions: recentTransactions,
  };
};

export const getCropFinanceService = async (ownerId, cropId) => {
  if (!mongoose.Types.ObjectId.isValid(cropId)) {
    const error = new Error("Invalid crop ID");
    error.status = 400;
    throw error;
  }

  const crop = await Crop.findOne({ _id: cropId, owner: ownerId }).populate("farm", "name");
  if (!crop) {
    const error = new Error("Crop not found");
    error.status = 404;
    throw error;
  }

  const summary = await getFinanceSummaryService(ownerId, { cropId });
  const recentTransactions = await FarmTransaction.find({ owner: ownerId, crop: cropId })
    .populate("farm", "name")
    .sort({ date: -1 })
    .limit(10);

  return {
    crop: {
      _id: crop._id,
      name: crop.name,
      variety: crop.variety,
      farm: crop.farm,
      currentStage: crop.currentStage,
      status: crop.status,
    },
    summary,
    transactions: recentTransactions,
  };
};
