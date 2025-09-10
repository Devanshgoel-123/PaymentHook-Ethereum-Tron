import { config } from "dotenv";
import { GeneralProvider } from "../GeneralProvider";
import { USDT_TOKEN_ETHEREUM } from "../../utils/config";
import { registerWebhook } from "../../services/EthereumService";
import { trackTransactionByHash } from "../../services/verify";
import { VerifyTraxnResult } from "../../utils/types";
import { updateWebhook, pauseWebhook, deleteWebhook } from "../../services/EthereumService";
config();

export class EthereumProvider implements GeneralProvider {
  chaindId: number = 1;
  webhookId: string = "";
  USDT_ADDRESS: string = USDT_TOKEN_ETHEREUM;

  /**
   * Register a webhook
   */
  async RegisterWebhook(): Promise<void> {
    try{
        const result = await registerWebhook();
        if(!result){
          throw new Error("Failed to register webhook");
        }
        this.webhookId = result;
    }catch(err){
      console.error("Error registering webhook", err);
      throw new Error("Failed to register webhook");
    }
  }

  /**
   * Create a monitoring session
   */
  async CreateMonitoringSession(): Promise<void> {
    throw new Error("Method not implemented.");
  }
/**
 * Update a webhook
 * @param userAddress 
 */
  async UpdateWebhook(userAddress:string): Promise<void> {
    try{
      if(!userAddress){
        throw new Error("User address is required");
      }
      const result=await updateWebhook(userAddress);
    }catch(err){
      console.error("Error updating webhook", err);
      throw new Error("Failed to update webhook");
    }
  }

  /**
   * Pause a webhook
   */
  async PauseWebhook(): Promise<void> {
    try{
      const result=await pauseWebhook(this.webhookId);
    }catch(err){
      console.error("Error pausing webhook", err);
      throw new Error("Failed to pause webhook");
    }
  }

  /**
   * Delete a webhook
   * @param webhookId 
   */
  async DeleteWebhook(webhookId:string): Promise<void> {
    try{
      const result=await deleteWebhook(webhookId);
    }catch(err){
      console.error("Error deleting webhook", err);
      throw new Error("Failed to delete webhook");
    }
  }
  /**
   * Verify a transaction
   * @param hash 
   * @returns 
   */
  async VerifyTransaction(hash:string): Promise<VerifyTraxnResult| null> {
    try{
      const result=await trackTransactionByHash(hash);
      if(!result){
        throw new Error("Failed to verify transaction");
      }
      return result;
    }catch(err){
      console.error("Error verifying transaction", err);
      return null
    }
  }
}
