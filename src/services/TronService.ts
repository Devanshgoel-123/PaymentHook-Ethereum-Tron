import { TronWeb } from "tronweb";
import { config } from "dotenv";
import { convertValuetoHumanFormat } from "./montior";
import { findActiveUsersAndInsertInDB } from "./EthereumService";
import { CHAIN_ID_TRON } from "../utils/config";
import { incrementUserCountInDB, insertUserInDB } from "./EthereumService";
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
    const from=getTronAdddress(event["0"]);
    const to=getTronAdddress(event["1"]);
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

/**
 * Update the webhook for the user
 * @param userAddress 
 * @returns 
 */
export const updateWebHookTron=async (userAddress:string)=>{
  try{
    const activeUsers = await findActiveUsersAndInsertInDB(CHAIN_ID_TRON);
    const existingUser = activeUsers?.find(
      (user) => user.address.toLowerCase() === userAddress.toLowerCase()
    );
    if(existingUser){
      await incrementUserCountInDB(
        existingUser.address.toLowerCase(),
        CHAIN_ID_TRON
      );
      return true;
    }else{
      await insertUserInDB(userAddress.toLowerCase(), CHAIN_ID_TRON, 1);
    }
  }catch(err){
    console.error("Error updating webhook",err);
  }
}

/**
 * Get the Tron address from the user address
 * @param userAddress 
 * @returns 
 */
export const getTronAdddress=(userAddress:string)=>{
  const result=TronWeb.address.fromHex(userAddress);
  return result;
}
