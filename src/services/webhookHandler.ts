import { completeMerchantOrderTracking } from "../services/montior";
import { CHAIN_ID_ETHEREUM, USDT_DECIMALS } from "../utils/config";
import { trackTransactionByHashEthereum } from "./verify";
import { findValueOfToken } from "./EthereumService";
import { TRANSFER_EVENT_SIG } from "../utils/config";
import { ethers } from "ethers";
/**
 * Complete merchant order tracking
 * @param req 
 * @param res 
 * @returns 
 */
export const CompleteMerchantOrderTracking=async (matchingTransactions:any) => {
    try{
        console.log("starting to CompleteMerchantOrderTracking");
        const result = await Promise.all(matchingTransactions.map(async (item:any)=>{
            const hash = item.transactionHash;
            console.log("item logs", item.logs)
            const transaction = await trackTransactionByHashEthereum(hash);
            console.log("transaction", transaction);
            const logs=item.logs[0];
            const decodedLog = decodeTransferLog(logs, USDT_DECIMALS);
            console.log("decodedLog", decodedLog);
            if(!transaction?.transaction.to || !decodedLog?.to){
                return false;
            }
            const input = item.input;
            const chainId= CHAIN_ID_ETHEREUM;
            const humanAmount = decodedLog?.amount;
            const receiver = decodedLog?.to;
            if(!humanAmount || !receiver){
                console.error("error finding value of token in human format");
                return false;
            }
          console.log("humanAmount", humanAmount);
            return await completeMerchantOrderTracking(hash, transaction?.transaction.to, parseFloat(humanAmount), chainId, receiver);
          }))
    return true;    
    }catch(err){
        return false;
    }
}


/**
 * Decode transfer log
 * @param log 
 * @param decimals 
 * @returns 
 */
export const decodeTransferLog=(
    log: {
      topics: string[];
      data: string;
    },
    decimals: number
  ) =>{
    if (!log || !log.topics || log.topics.length < 3) {
        throw new Error("Invalid log: missing topics");
      }
      const from = "0x" + log.topics[1]?.slice(-40);
      const to = "0x" + log.topics[2]?.slice(-40);
    const rawAmount: bigint = log.data ? BigInt(log.data) : 0n;
    const amount = ethers.formatUnits(rawAmount, decimals);
    return { from, to, amount, rawAmount };
  }