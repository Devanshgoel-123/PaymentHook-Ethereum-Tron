import axios from "axios";
import { BASE_QUICK_NODE_URL, TEMPLATE_ID } from "../utils/constants";
import { ethers } from "ethers";

/**
 *
 * @param address
 */
export const RegisterWebhook = async () => {
  try {
    const url = `${BASE_QUICK_NODE_URL}/webhooks/rest/v1/webhooks/template/${TEMPLATE_ID}`;
    const payload = {
      name: "My Wallet Monitor Webhook",
      network: "ethereum-mainnet",
      notification_email: "devanshgoel112233@gmail.com",
      destination_attributes: {
        url: "https://7fb9f5a792a3.ngrok-free.app",
        compression: "gzip",
      },
      status: "active",
      templateArgs: {
        wallets: ["0x2F60554FADA00a128e53b055a5eBfeFe6Fc2D53b"],
      },
    };
    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      "x-api-key": `${process.env.QUICK_NODE_API_KEY}`,
    };
    const result = await axios.post(url, payload, { headers });
    console.log(result.data);
    return result.data.id as string;
  } catch (err) {
    console.error("Error:", err);
  }
};

/**
 * Update a webhook
 */
export const UpdateWebhook = async () => {
  try {
    const url = `${BASE_QUICK_NODE_URL}/webhooks/rest/v1/webhooks/template/${TEMPLATE_ID}`;
    const payload = {
      name: "My Wallet Monitor Webhook",
    };
  } catch (err) {
    console.error("Error:", err);
  }
};

export const findValueOfToken=async(input:string)=>{
    try{
        const iface = new ethers.Interface(["function transfer(address to, uint256 value)"]);
        const decoded = iface.decodeFunctionData("transfer", input);
        const valueInWei = decoded.value.toString(); // 300,000 (smallest units)
        console.log(valueInWei);
        const decimals = 6; // For USDC
        const valueInToken = valueInWei / Math.pow(10, decimals);
        return valueInToken;
    }catch(err){
        console.error("Error:", err);
    }
}


export const amountMatches=(received: number, expected: number, tolerancePct = 2): boolean => {
  const diff = Math.abs(received - expected);
  return diff <= expected * (tolerancePct / 100);
}