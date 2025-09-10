import { completeMerchantOrderTracking } from "../services/montior";
import { trackTransactionByHash } from "./verify";
/**
 * Complete merchant order tracking
 * @param req 
 * @param res 
 * @returns 
 */
export const CompleteMerchantOrderTracking=async (matchingTransactions:any) => {
    try{
        const result = await matchingTransactions.map(async (item:any)=>{
            const hash = item.hash;
            const transaction = await trackTransactionByHash(hash);
            if(!transaction?.transaction.to){
                return false;
            }
            const input = item.input;
            return await completeMerchantOrderTracking(hash, transaction?.transaction.to, input);
          })
        return true;    
    }catch(err){
        return false;
    }
}