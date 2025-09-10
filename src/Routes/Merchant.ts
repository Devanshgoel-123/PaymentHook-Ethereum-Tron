import express from "express";
import * as MerchantProvider from "../providers/Merchant/MerchantProvider";

export const merchantRouter=express.Router();

merchantRouter.post("/verifyTransaction", MerchantProvider.TrackTransactionByHash);
