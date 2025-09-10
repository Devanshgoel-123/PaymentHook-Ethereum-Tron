import { completeMerchantOrderTracking } from "../services/montior";
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
            const input = item.input;
            const address = item.to;
            return await completeMerchantOrderTracking(hash, address, input);
          })
        return true;    
    }catch(err){
        return false;
    }
}