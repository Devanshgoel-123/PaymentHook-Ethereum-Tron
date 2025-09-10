import { config } from "dotenv";
import { GeneralProvider } from "../GeneralProvider";
config();
import { RegisterWebhook } from "../../services/EthereumService";


export class EthereumProvider implements GeneralProvider {
  chaindId: number = 1;
  webhookId: string = "";

  async RegisterWebhook(): Promise<void> {
    try{
        const result = await RegisterWebhook();
        if(!result){
          throw new Error("Failed to register webhook");
        }
        this.webhookId = result;
    }catch(err){
      console.error("Error registering webhook", err);
      throw new Error("Failed to register webhook");
    }
  }
  async CreateMonitoringSession(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async UpdateWebhook(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async PauseWebhook(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async StartWebhook(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async DeleteWebhook(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
