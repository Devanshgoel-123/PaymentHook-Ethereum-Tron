import { MonitoringSessions } from "../db/schema";
import { db } from "../db/db";
import { TRANSACTIONS_CONFIRMATIONS_ETHEREUM, TRANSACTIONS_CONFIRMATIONS_TRON } from "../utils/constants";

/**
 * Create a monitoring session for an address
 * @param address 
 */
export const createMontioringSessionForAddress=async(address:string, amount:string, token:string, chain:number):Promise<number | null>=>{
    try{
        const txConfirmationsRequired = chain === 1 ? TRANSACTIONS_CONFIRMATIONS_ETHEREUM : TRANSACTIONS_CONFIRMATIONS_TRON;
        const session = await db.insert(MonitoringSessions).values({
            address:address,
            amount: amount,
            token: token,
            chainId: chain,
            txConfirmationsRequired:txConfirmationsRequired,
            txConfirmations:0,
            txHash:"",
            status:"pending",
            createdAt:new Date(),
            updatedAt:new Date(),
        }).returning()
        if(!session[0]){
            return null;
        }
        return session[0].id;
    }catch(err){
        console.error("error creating monitoring session", err);
        return null;
    }
}


