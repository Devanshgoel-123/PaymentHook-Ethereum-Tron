import { Router } from "express";
import * as VerifyProvider from "../providers/Verify/ verify";
export const verifyRouter = Router();

verifyRouter.post("/verifyTransaction", VerifyProvider.verifyTransaction);