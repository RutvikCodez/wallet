import { Router } from "express";
import {
  createTransactios,
  deleteTransactions,
  getTransactionsByUserId,
  getTransactionsSummaryByUserId,
} from "../controllers/transactionsControllers.js";

const router = Router();

router.get("/:userId", getTransactionsByUserId);

router.post("/", createTransactios);

router.delete("/:id", deleteTransactions);

router.get("/summary/:userId", getTransactionsSummaryByUserId);

export default router;
