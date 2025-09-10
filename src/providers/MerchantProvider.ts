import { createMontioringSessionForAddress } from "../services/montior";
import { Request, Response } from "express";
import { BAD_REQUEST_CODE, INTERNAL_ERROR_CODE } from "../utils/constants";

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