import { completeMerchantOrderTracking } from "../services/montior";
import { CHAIN_ID_ETHEREUM } from "../utils/config";
import { trackTransactionByHashEthereum } from "./verify";
import { findValueOfToken } from "./EthereumService";
/**
 * Complete merchant order tracking
 * @param req 
 * @param res 
 * @returns 
 */
export const CompleteMerchantOrderTracking=async (matchingTransactions:any) => {
    try{
        // console.log("starting to CompleteMerchantOrderTracking");
        const result = await matchingTransactions.map(async (item:any)=>{
            const hash = item.hash;
            //console.log("hash", hash);
            const transaction = await trackTransactionByHashEthereum(hash);
           // console.log("transaction", transaction);
            if(!transaction?.transaction.to){
                return false;
            }
            const input = item.input;
            const chainId= CHAIN_ID_ETHEREUM;
            const resultValue = findValueOfToken(input);
            const humanAmount = resultValue?.amount;
            const receiver = resultValue?.receiver;
            if(!humanAmount || !receiver){
                console.error("error finding value of token in human format");
                return false;
            }
          //  console.log("humanAmount", humanAmount);
            return await completeMerchantOrderTracking(hash, transaction?.transaction.to, humanAmount, chainId, receiver);
          })
        return true;    
    }catch(err){
        return false;
    }
}