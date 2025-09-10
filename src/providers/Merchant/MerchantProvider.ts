import { createMontioringSessionForAddress } from "../../services/montior";
import { Request, Response } from "express";
import { BAD_REQUEST_CODE, INTERNAL_ERROR_CODE } from "../../utils/constants";
import { completeMerchantOrderTracking } from "../../services/montior";
import { trackTransactionByHash } from "../../services/verify";
/**
 * Create a merchant order session
 * @param req 
 * @param res 
 * @returns 
 */
export const CreateMerchantOrderSessions=async (req:Request, res:Response) => {
    try{
        const {address, amount, token, chain} = req.body;
        if(!address || !amount || !token || !chain){
            return res.status(BAD_REQUEST_CODE).json({message: "Invalid request"});
        }
        const session = await createMontioringSessionForAddress(address, amount, token, chain);
        res.status(200).json(session);
    }catch(err){
        return res.status(INTERNAL_ERROR_CODE).json({message: "Internal server error"});
    }
}

/**
 * Track a transaction by hash
 * @param req 
 * @param res 
 * @returns 
 */
export const TrackTransactionByHash=async (req:Request, res:Response) => {
    try{
        const {hash} = req.body;
        const response=await trackTransactionByHash(hash);
        if(!hash){
            return res.status(BAD_REQUEST_CODE).json({message: "Invalid request"});
        }
        return res.status(200).json(response);
    }catch(err){
        return res.status(INTERNAL_ERROR_CODE).json({message: "Internal server error"});
    }
}

/**
 * Complete merchant order tracking
 * @param req 
 * @param res 
 * @returns 
 */
export const CompleteMerchantOrderTracking=async (req:Request, res:Response) => {
    try{
        const result = await req.body.matchingTransactions.map(async (item:any)=>{
            const hash = item.hash;
            const input = item.input;
            const address = item.to;
            return await completeMerchantOrderTracking(hash, address, input);
          })
         console.log(result);
    res.status(200).send("Hello World");
    }catch(err){
        return res.status(INTERNAL_ERROR_CODE).json({message: "Internal server error"});
    }
}