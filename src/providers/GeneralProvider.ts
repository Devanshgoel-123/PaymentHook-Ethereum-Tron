import { CHAIN_ID_ETHEREUM, CHAIN_ID_TRON } from "../utils/constants";
import { EthereumProvider } from "./Ethereum/EthereumProvider";



export interface GeneralProvider {
    chaindId:number;
    webhookId:string;

    RegisterWebhook:()=>Promise<void>;

    UpdateWebhook:()=>Promise<void>;

    PauseWebhook:()=>Promise<void>;

    StartWebhook:()=>Promise<void>;

    DeleteWebhook:()=>Promise<void>;
    // FetchAllWebhooks:()=>Promise<void>;
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