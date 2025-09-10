import { CHAIN_ID_ETHEREUM, CHAIN_ID_TRON } from "../utils/config";
import { EthereumProvider } from "./Ethereum/EthereumProvider";
import { VerifyTraxnResult } from "../utils/types";


export interface GeneralProvider {
    chaindId:number;
    webhookId:string;
    USDT_ADDRESS:string;
    
    RegisterWebhook:()=>Promise<void>;

    UpdateWebhook:(userAddress:string)=>Promise<void>;

    PauseWebhook:()=>Promise<void>;

    DeleteWebhook:(webhookId:string)=>Promise<void>;

    VerifyTransaction:(hash:string)=>Promise<VerifyTraxnResult | null>;
}

export class ExchangeFactory {
    static getAdapter(name: string): GeneralProvider {
      switch (name) {
        case CHAIN_ID_ETHEREUM.toString():
          return new EthereumProvider()
        // case CHAIN_ID_TRON:
        //   return new GateXAdapter();
        default:
          throw new Error(`Exchange ${name} not supported`);
      }
    }
  }