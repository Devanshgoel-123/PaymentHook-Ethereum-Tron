import { VerifyTraxnResult, VerifyPaymentResult} from "../utils/types";
import { MonitoringSessions } from "../db/schema";
import axios from "axios";
import { and, eq } from "drizzle-orm";
import { db } from "../db/db";
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
              status: "completed"
            }
          };  
    }catch(err){
        console.error("error tracking transaction by hash", err);
        return null;
    }
}

/**
 * Verify a transaction by payment hash
 * @param txHash 
 * @param chain 
 * @param orderId 
 * @returns 
 */
export const verifyTransactionByPayment = async (
  txHash: string,
  chain: number,
  orderId: number
):Promise<VerifyPaymentResult | null> => {
  try {
    const session = await db
      .select()
      .from(MonitoringSessions)
      .where(
        and(
          eq(MonitoringSessions.txHash, txHash),
          eq(MonitoringSessions.chainId, chain),
          eq(MonitoringSessions.id, orderId)
        )
      );
    if(!session[0]){
      return null;
    }
    const sessionObject = session[0];
    const result:VerifyPaymentResult = {
      verified: true,
      transaction: {
        hash:txHash,
        to:sessionObject.address,
        amount:sessionObject.amount,
        token:sessionObject.token,
        status:sessionObject.status
      },
      payment_match: {
        expected: session[0].amount,
        received: session[0].receivedAmount,
        matches: true
      }
    }
    return result
  } catch (err) {
    console.error("error verifying transaction by payment", err);
    return null;
  }
};
