import { Router } from "express";
import { Request, Response } from "express";
import { CompleteMerchantOrderTracking } from "../services/webhookHandler";
import { INTERNAL_ERROR_CODE, SUCCESS_CODE } from "../utils/constants";
import { ethereumProvider } from "../index";
export const webhookRouter = Router();

/**
 * Webhook update
 */
webhookRouter.post("/webhookUpdate", async (req: Request, res: Response) => {
  console.log(req.body.matchingTransactions);
  try {
    const matchingTransactions = req.body.matchingTransactions;
    const result = await CompleteMerchantOrderTracking(matchingTransactions);
    if (!result) {
      return res.status(INTERNAL_ERROR_CODE).send({
        message: "Webhook updated failed",
      });
    }
    res.status(SUCCESS_CODE).send({
      message: "Webhook updated successfully",
    });
  } catch (err) {
    return res.status(INTERNAL_ERROR_CODE).send({
      message: "Webhook updated failed",
    });
  }
});

/**
 * Ethereum webhook
 */
webhookRouter.post("/ethereum", async (req: Request, res: Response) => {
  try {
    const result= await ethereumProvider.RegisterWebhook();
    res.status(SUCCESS_CODE).send({ message: "Ethereum webhook processed" });
  } catch (err) {
    console.error("Error processing Ethereum webhook:", err);
    res.status(INTERNAL_ERROR_CODE).send({ error: "Failed to process Ethereum webhook" });
  }
});

/**
 * Tron webhook
 */
webhookRouter.get("/tron", async (req: Request, res: Response) => {
  try {
    res.status(SUCCESS_CODE).send({ message: "Tron webhook processed" });
  } catch (err) {
    console.error("Error processing Ethereum webhook:", err);
    res.status(INTERNAL_ERROR_CODE).send({ error: "Failed to process Ethereum webhook" });
  }
});
