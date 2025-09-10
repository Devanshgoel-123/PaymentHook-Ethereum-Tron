import { createMontioringSessionForAddress, getMerchantOrderStatus } from "../../services/montior";
import { Request, Response } from "express";
import { BAD_REQUEST_CODE, INTERNAL_ERROR_CODE, SUCCESS_CODE } from "../../utils/constants";
import { completeMerchantOrderTracking } from "../../services/montior";
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
        const resultObject={
            sessionId:session,
            address:address,
            expectedAmount:amount,
            status:"pending"
        }
        res.status(200).json({
            result:resultObject
        });
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


export const GetMerchantOrderStatus=async (req:Request, res:Response) => {
    try{
        const {sessionId} = req.params;
        if(!sessionId){
            return res.status(BAD_REQUEST_CODE).json({message: "Incorrect Session ID"});
        } 
        const status = await getMerchantOrderStatus(Number(sessionId));
        if(!status){
            return res.status(INTERNAL_ERROR_CODE).json({message: "Session not found"});
        }
        res.status(SUCCESS_CODE).json({status:status});
    }catch(err){
        return res.status(INTERNAL_ERROR_CODE).json({message: "Internal server error"});
    }
}