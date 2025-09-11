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
        const result = await matchingTransactions.map(async (item:any)=>{
            const hash = item.hash;
            const transaction = await trackTransactionByHashEthereum(hash);
            if(!transaction?.transaction.to){
                return false;
            }
            const input = item.input;
            const chainId= CHAIN_ID_ETHEREUM;
            const humanAmount = findValueOfToken(input);
            if(!humanAmount){
                console.error("error finding value of token in human format");
                return false;
            }
            return await completeMerchantOrderTracking(hash, transaction?.transaction.to, humanAmount, chainId);
          })
        return true;    
    }catch(err){
        return false;
    }
}