import { Router } from "express";
import * as MerchantProvider from "../providers/Merchant/MerchantProvider";
export const monitorRouter = Router();

monitorRouter.post("/register",MerchantProvider.CreateMerchantOrderSessions); //testing done for Ethereum
monitorRouter.get("/status",MerchantProvider.GetMerchantOrderStatus); // Done