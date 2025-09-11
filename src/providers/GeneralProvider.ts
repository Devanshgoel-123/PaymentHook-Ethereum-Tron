import { CHAIN_ID_ETHEREUM, CHAIN_ID_TRON } from "../utils/config";
import { EthereumProvider } from "./Ethereum/EthereumProvider";
import { VerifyTraxnResult } from "../utils/types";
import { TronProvider } from "./Tron/TronProvider";

export interface GeneralProvider {
    chaindId:number;
    webhookId:string;
    USDT_ADDRESS:string;
    
    RegisterWebhook:()=>Promise<boolean>;

    UpdateWebhook:(userAddress:string)=>Promise<void>;

    PauseWebhook:()=>Promise<void>;

    DeleteWebhook:(webhookId:string)=>Promise<void>;

    VerifyTransaction:(hash:string)=>Promise<VerifyTraxnResult | null>;

    RegisterMonitoringSession:(address:string, amount:string, token:string)=>Promise<number | null>;
}

export class ExchangeFactory {
    static getAdapter(name: string): GeneralProvider {
      switch (name) {
        case CHAIN_ID_ETHEREUM.toString():
          return new EthereumProvider()
        case CHAIN_ID_TRON.toString():
          return new TronProvider();
        default:
          throw new Error(`Exchange ${name} not supported`);
      }
    }
  }