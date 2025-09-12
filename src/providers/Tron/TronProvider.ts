import { GeneralProvider } from "../GeneralProvider";
import { CHAIN_ID_TRON, USDT_TOKEN_TRON } from "../../utils/config";
import { VerifyTraxnResult } from "../../utils/types";
import { getTronAdddress, registerWebhookClientTron } from "../../services/TronService";
import { TronWeb } from "tronweb";
import { completeMerchantOrderTracking, createMontioringSessionForAddress, updateOrderStatusInDB } from "../../services/montior";
import { getActiveSessions } from "../../services/montior";
import { processEventResult } from "../../services/TronService";
import { updateWebHookTron } from "../../services/TronService";
import { trackTransactionByHashTron } from "../../services/verify";


export class TronProvider implements GeneralProvider {
  chaindId: number = CHAIN_ID_TRON;
  webhookId: string = "";
  USDT_ADDRESS: string = USDT_TOKEN_TRON;
  client: TronWeb | null = null;
  pollInterval: NodeJS.Timeout | null = null;
  lastTimestamp: number = Date.now();
  processedTx: Set<string> = new Set();

  async RegisterWebhook(): Promise<boolean> {
    try {
      this.client = await registerWebhookClientTron();
      this.startPolling();
      return true;
    } catch (err) {
      console.error("Error registering webhook", err);
      return false;
    }
  }

  async UpdateWebhook(_userAddress: string): Promise<boolean> {
      try{
        const result=await updateWebHookTron(_userAddress);
        if(result){
          return true;
        }
        return false
      }catch(err){
        console.error("Error updating webhook", err);
        return false;
      }
  }

  async PauseWebhook(): Promise<void> {
    try {
      if (this.pollInterval) {
        clearInterval(this.pollInterval);
        this.pollInterval = null;
      }
    } catch (err) {
      console.error("Error pausing webhook", err);
    }
  }

  async DeleteWebhook(_webhookId: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async RegisterMonitoringSession(
    address: string,
    amount: string,
    token: string
  ): Promise<number | null> {
    try {
      this.UpdateWebhook(address);
      const result = await createMontioringSessionForAddress(
        address,
        amount,
        token,
        this.chaindId
      );
      if (!result) {
        throw new Error("Failed to register monitoring session");
      }
      return result;
    } catch (err) {
      console.error("Error registering monitoring session", err);
      return null;
    }
  }

  async VerifyTransaction(_hash: string): Promise<VerifyTraxnResult | null> {
     try{
        const result=await trackTransactionByHashTron(_hash, this.client);
        return result;
     }catch(err){
        console.error("Error verifying transaction", err);
        return null;
     }
  }

  private startPolling() {
    if (!this.client) throw new Error("Tron client not initialized");
    console.log("Starting Tron polling loop every 3s...");
    this.pollInterval = setInterval(() => this.checkEvents(), 3000);
  }

  public async checkEvents() {
    if (!this.client) {
      console.error("Tron client not initialized");
      return;
    }
    try {
      // 1. Get all active monitoring sessions from DB
      const sessions = await getActiveSessions(this.chaindId);
      if (!sessions || sessions.length === 0){
        console.log("No active monitoring sessions");
        return;
      };

      const events = await this.client.getEventResult(this.USDT_ADDRESS, {
        eventName: "Transfer",
        onlyConfirmed: true,
        limit: 100, //max-limit is 200
      });

      const eventsFormatted = events.data
        ?.map((item) => {
          const result = processEventResult(item.result);
          if (!result?.valueInHumanFormat) {
            return null;
          }
          return {
            hash: `0x${item.transaction_id}`,
            to: result?.to,
            value: result?.valueInHumanFormat,
            from: result?.from,
          };
        })
        ?.filter((item) => item !== null);

      if (eventsFormatted && eventsFormatted.length > 0) {
        for (const evt of eventsFormatted) {
          if (this.processedTx.has(evt.hash)) continue;
          this.processedTx.add(evt.hash);
          for (const session of sessions) {
            if (session.address.toLowerCase() === evt.to.toLowerCase()) {
              const expectedAmount = Number(session.amount);
              const tolerance = expectedAmount * 0.02;
              if (Math.abs(evt.value - expectedAmount) <= tolerance) {
              const result=await updateOrderStatusInDB(session.id, evt.hash, evt.value, expectedAmount, evt.to.toLowerCase(), this.chaindId );
               if(!result){
                console.error("Error updating order status in DB");
               }
              }
            }
          }
        }
        //this.lastTimestamp = events[events.length - 1].timestamp + 1;
      }
    } catch (err) {
      console.error("Polling error:", err);
    }
  }
}
