import { TronWeb } from "tronweb";
import { config } from "dotenv";
import { TransactionDataTron } from "../utils/types";
import { convertValuetoHumanFormat } from "./montior";
config();
/**
 * Register a webhook client for Tron
 * @returns TronWeb client
 */
export const registerWebhookClientTron = () => {
    const API_KEY=process.env.TRON_API_KEY;
    if(!API_KEY){
        throw new Error("TRON_API_KEY is not set");
    }
    const tronWeb = new TronWeb({
        fullHost: 'https://api.trongrid.io',
        headers: { 'TRON-PRO-API-KEY': API_KEY },
      });
    return tronWeb;
};


/**
 * Process the event result
 * @param event 
 * @returns 
 */
export const processEventResult=(event:any)=>{
  try{
    const from=event["0"];
    const to=event["1"];
    const value=parseFloat(event["2"]);
    const valueInHumanFormat = convertValuetoHumanFormat(value)
    return {
      from,
      to,
      valueInHumanFormat
    }
  }catch(err){
    console.error("Error processing event result",err);
    return null;
  }
}