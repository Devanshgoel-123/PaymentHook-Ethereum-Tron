import axios from "axios";
import { BASE_QUICK_NODE_URL, TEMPLATE_ID } from "../utils/constants";
import { ethers } from "ethers";
import {config} from "dotenv";
import { convertValuetoHumanFormat } from "./montior";
config();
const QUICKNODE_ETHEREUM_HEADERS={
  accept: "application/json",
  "Content-Type": "application/json",
  "x-api-key": `${process.env.QUICK_NODE_API_KEY}`,
}

const QUICKNODE_ETHEREUM_PAYLOAD={
  name: "My Wallet Monitor Webhook",
  network: "ethereum-mainnet",
  notification_email: "devanshgoel112233@gmail.com",
  destination_attributes: {
    url: `${process.env.BACKEND_URL}`,
    compression: "gzip",
  },
  status: "active",
  templateArgs: {
    wallets: [],
  },
}

/**
 *
 * @param address
 */
export const registerWebhook = async () => {
  try {
    const url = `${BASE_QUICK_NODE_URL}/webhooks/rest/v1/webhooks/template/${TEMPLATE_ID}`;
    const result = await axios.post(url, QUICKNODE_ETHEREUM_PAYLOAD, { headers: QUICKNODE_ETHEREUM_HEADERS });
    console.log(result.data);
    return result.data.id as string;
  } catch (err) {
    console.error("Error:", err);
  }
};

/**
 * Update a webhook
 */
export const updateWebhook = async (userAddress:string, webhookId:string) => {
  try {
    const url = `${BASE_QUICK_NODE_URL}/webhooks/rest/v1/webhooks/${webhookId}`;
    // Check if the userAddress is already in the wallets array
    const updatePayload = {
      ...QUICKNODE_ETHEREUM_PAYLOAD,
      templateArgs: {
        ...QUICKNODE_ETHEREUM_PAYLOAD.templateArgs,
        wallets: [...QUICKNODE_ETHEREUM_PAYLOAD.templateArgs.wallets, userAddress],
      },
    };
    const result = await axios.patch(url, updatePayload, { headers: QUICKNODE_ETHEREUM_HEADERS });
    console.log(result.data);
    return result.data.id as string;
  } catch (err) {
    console.error("Error:", err);
  }
};

/**
 * Pause a webhook
 * @param webhookId 
 * @returns 
 */
export const pauseWebhook = async (webhookId:string) => {
  try {
    const url = `${BASE_QUICK_NODE_URL}/webhooks/rest/v1/webhooks/${webhookId}/pause`;
    const result = await axios.post(url, { status: "paused" }, { headers: QUICKNODE_ETHEREUM_HEADERS });
    console.log(result.data);
    return result.data.id as string;
  } catch (err) {
    console.error("Error:", err);
  }
};


export const deleteWebhook = async (webhookId:string) => {
  try {
    const url = `${BASE_QUICK_NODE_URL}/webhooks/rest/v1/webhooks/${webhookId}`;
    const result = await axios.delete(url, { headers: QUICKNODE_ETHEREUM_HEADERS });
    console.log(result.data);
    return result.data.id as string;
  } catch (err) {
    console.error("Error:", err);
  }
};


export const GetWebhookInfo = async (webhookId:string) => {
  try{
    const url = `${BASE_QUICK_NODE_URL}/webhooks/rest/v1/webhooks/${webhookId}`;
    const result = await axios.get(url, { headers: QUICKNODE_ETHEREUM_HEADERS });
    console.log(result.data);
    return result.data.destination_attributes;
  }catch(err){
    console.error("Error:", err);
  }
}
/**
 * Find the value of a token
 * @param input 
 * @returns 
 */
export const findValueOfToken=(input:string):number | null=>{
    try{
        const iface = new ethers.Interface(["function transfer(address to, uint256 value)"]);
        const decoded = iface.decodeFunctionData("transfer", input);
        const valueInWei = decoded.value.toString(); // 300,000 (smallest units
        const valueInToken = convertValuetoHumanFormat(valueInWei)
        return valueInToken;
    }catch(err){
        console.error("Error:", err);
        return null;
    }
}


/**
 * Check if the amount matches
 * @param received 
 * @param expected 
 * @param tolerancePct 
 * @returns 
 */
export const amountMatches=(received: number, expected: number, tolerancePct = 2): boolean => {
  const diff = Math.abs(received - expected);
  return diff <= expected * (tolerancePct / 100);
}