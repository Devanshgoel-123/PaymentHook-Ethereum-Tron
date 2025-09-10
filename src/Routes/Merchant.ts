import express from "express";
import * as MerchantProvider from "../providers/MerchantProvider";
export const merchantRouter=express.Router();


merchantRouter.post("/register", MerchantProvider.CreateMerchantOrderSessions);