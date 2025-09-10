import { VerifyTraxnResult } from "../utils/types";
import axios from "axios";

/**
 * Track a transaction by hash
 * @param hash 
 * @returns 
 */

export const trackTransactionByHash=async(hash:string):Promise<VerifyTraxnResult | null>=>{
    try{
        const requestPayload = {
            jsonrpc: "2.0",
            method: "eth_getTransactionByHash",
            params: [hash],
            id: 1,
          };
      
          // Make the POST request using Axios
          const response = await axios.post(
            "https://docs-demo.quiknode.pro/",
            requestPayload,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
      
          if (response.data.error) {
            console.error("JSON-RPC error:", response.data.error.message);
            return null;
          }
          const object=response.data.result;
          return {
            verified: true,
            transaction: {
              hash: object.hash,
              from: object.from,
              to: object.to,
              amount: object.value,
              token:"USDT",
              status: true
            }
          };  
    }catch(err){
        console.error("error tracking transaction by hash", err);
        return null;
    }
}