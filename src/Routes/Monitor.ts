import { Router } from "express";
import * as MerchantProvider from "../providers/Merchant/MerchantProvider";
export const monitorRouter = Router();

monitorRouter.post("/register",MerchantProvider.CreateMerchantOrderSessions);
monitorRouter.get("/status",MerchantProvider.GetMerchantOrderStatus);