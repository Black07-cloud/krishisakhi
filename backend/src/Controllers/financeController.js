import {
  createTransactionService,
  getTransactionsService,
  getTransactionByIdService,
  updateTransactionService,
  deleteTransactionService,
  getFinanceSummaryService,
  getFarmFinanceService,
  getCropFinanceService,
} from "../services/financeService.js";

/* -------------------------------------------------------
   POST /api/finance/transactions
------------------------------------------------------- */
export const createTransaction = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const { farmId, farm, type, category, amount } = req.body;

    if (!farmId && !farm) {
      return res.status(400).json({
        success: false,
        message: "Farm ID is required",
      });
    }

    if (!type || !["income", "expense"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Transaction type must be 'income' or 'expense'",
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    if (amount === undefined || amount === null || isNaN(amount) || Number(amount) < 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a non-negative number",
      });
    }

    const transaction = await createTransactionService(ownerId, req.body);

    return res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      data: transaction,
    });
  } catch (error) {
    console.error("Create Transaction Error:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to create transaction",
    });
  }
};

/* -------------------------------------------------------
   GET /api/finance/transactions
------------------------------------------------------- */
export const getTransactions = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const result = await getTransactionsService(ownerId, req.query);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get Transactions Error:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to fetch transactions",
    });
  }
};

/* -------------------------------------------------------
   GET /api/finance/transactions/:id
------------------------------------------------------- */
export const getTransactionById = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const { id } = req.params;

    const transaction = await getTransactionByIdService(ownerId, id);

    return res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error("Get Transaction By ID Error:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to fetch transaction",
    });
  }
};

/* -------------------------------------------------------
   PUT /api/finance/transactions/:id
------------------------------------------------------- */
export const updateTransaction = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const { id } = req.params;

    const { amount, type } = req.body;

    if (type && !["income", "expense"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Transaction type must be 'income' or 'expense'",
      });
    }

    if (amount !== undefined && (isNaN(amount) || Number(amount) < 0)) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a non-negative number",
      });
    }

    const updated = await updateTransactionService(ownerId, id, req.body);

    return res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update Transaction Error:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to update transaction",
    });
  }
};

/* -------------------------------------------------------
   DELETE /api/finance/transactions/:id
------------------------------------------------------- */
export const deleteTransaction = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const { id } = req.params;

    await deleteTransactionService(ownerId, id);

    return res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    console.error("Delete Transaction Error:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to delete transaction",
    });
  }
};

/* -------------------------------------------------------
   GET /api/finance/summary
------------------------------------------------------- */
export const getFinanceSummary = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const summary = await getFinanceSummaryService(ownerId, req.query);

    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("Get Finance Summary Error:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to calculate financial summary",
    });
  }
};

/* -------------------------------------------------------
   GET /api/finance/farm/:farmId
------------------------------------------------------- */
export const getFarmFinance = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const { farmId } = req.params;

    const data = await getFarmFinanceService(ownerId, farmId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get Farm Finance Error:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to fetch farm finance",
    });
  }
};

/* -------------------------------------------------------
   GET /api/finance/crop/:cropId
------------------------------------------------------- */
export const getCropFinance = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const { cropId } = req.params;

    const data = await getCropFinanceService(ownerId, cropId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get Crop Finance Error:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to fetch crop finance",
    });
  }
};
