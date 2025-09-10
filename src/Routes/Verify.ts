import { Router } from "express";
import * as VerifyProvider from "../providers/Verify/ verify";
export const verifyRouter = Router();

verifyRouter.post("/verify/transaction", VerifyProvider.verifyTransactionByHash);
verifyRouter.post("/verify/payment", VerifyProvider.verifyTransactionByPaymentHash);
