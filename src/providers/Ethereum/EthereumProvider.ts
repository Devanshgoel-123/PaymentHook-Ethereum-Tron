import { config } from "dotenv";
import { GeneralProvider } from "../GeneralProvider";
import { CHAIN_ID_ETHEREUM, USDT_TOKEN_ETHEREUM } from "../../utils/config";
import { registerWebhook } from "../../services/EthereumService";
import { trackTransactionByHashEthereum } from "../../services/verify";
import { VerifyTraxnResult } from "../../utils/types";
import { updateWebhook, pauseWebhook, deleteWebhook, startWebhook } from "../../services/EthereumService";
import { createMontioringSessionForAddress } from "../../services/montior";
import { webhooks } from "../../db/schema";
import { db } from "../../db/db";
import { getWebhookIdFromDB } from "../../services/EthereumService";
config();

export class EthereumProvider implements GeneralProvider {
  chaindId: number = CHAIN_ID_ETHEREUM;
  webhookId: string = "";
  USDT_ADDRESS: string = USDT_TOKEN_ETHEREUM;

  /**
   * Register a webhook
   */
  async RegisterWebhook(): Promise<boolean> {
    try{
        const webhookId=await getWebhookIdFromDB(this.chaindId);
        if(webhookId){
          this.webhookId = webhookId;
          const startResult=await this.StartWebhook()
          if(!startResult){
            console.error("Failed to start webhook");
            return false;
          }
          return true;
        }else{
          const result = await registerWebhook();
          if(!result){
            throw new Error("Failed to register webhook");
          }
          const webhookResult=await db.insert(webhooks).values({
            webhookId: result,
            chainId: this.chaindId,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: "active"
          }).returning()
          this.webhookId = result;
          return true;
        }
    }catch(err){
      console.error("Error registering webhook", err);
      return false;
    }
  }

  /**
   * Create a monitoring session
   */
  async RegisterMonitoringSession(address:string, amount:string, token:string): Promise<number | null> {
    try{
      const response=await this.UpdateWebhook(address);
      if(!response){
        console.error("Failed to update webhook");
        return null;
      }
      const result=await createMontioringSessionForAddress(address, amount, token, this.chaindId);
      const startResponse=await this.StartWebhook();
      if(!startResponse){
        console.error("Failed to start webhook");
        return null;
      }
      //start the webhook also here
      if(!result){
        console.error("Failed to register monitoring session");
        return null;
      }
      return result;
    }catch(err){
      console.error("Error registering monitoring session", err);
      return null;
    }
  }
/**
 * Update a webhook
 * @param userAddress 
 */
  async UpdateWebhook(userAddress:string): Promise<boolean> {
    try{
      await this.PauseWebhook();
      if(!userAddress){
        console.error("User address is required");
        return false;
      }
      const result=await updateWebhook(userAddress, this.webhookId);
      if(!result){
        console.error("Failed to update webhook");
        return false;
      }
      return true;
    }catch(err){
      console.error("Error updating webhook", err);
      return false;
    }
  }

  /**
   * Start a webhook
   */
  async StartWebhook(): Promise<boolean> {
    try{
      const result=await startWebhook(this.webhookId);
      if(!result){
        console.error("Failed to start webhook");
        return false;
      }
      return true;
    }catch(err){
      console.error("Error starting webhook", err);
     return false;
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
      const result=await trackTransactionByHashEthereum(hash);
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
