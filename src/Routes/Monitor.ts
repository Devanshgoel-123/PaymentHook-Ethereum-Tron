import { Router } from "express";
import { CreateMerchantOrderSessions } from "../providers/Merchant/MerchantProvider";
export const monitorRouter = Router();

monitorRouter.post("/register",CreateMerchantOrderSessions);