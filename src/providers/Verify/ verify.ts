import { Request, Response } from "express";
import { trackTransactionByHash } from "../../services/verify";
import { INTERNAL_ERROR_CODE, SUCCESS_CODE } from "../../utils/constants";
import { verifyTransactionByPayment } from "../../services/verify";
import { BAD_REQUEST_CODE,  } from "../../utils/constants";
/**
 * Verify a transaction
 * @param req
 * @param res
 * @returns
 */
export const verifyTransactionByHash = async (req: Request, res: Response) => {
  try {
    const { hash } = req.body;
    const result = await trackTransactionByHash(hash);
    res.status(200).send(result);
  } catch (err) {
    return res
      .status(INTERNAL_ERROR_CODE)
      .json({ message: "Internal server error" });
  }
};


/**
 * Verify a transaction by payment hash
 * @param req 
 * @param res 
 * @returns 
 */
export const verifyTransactionByPaymentHash = async (req: Request, res: Response) => {
  try{
    const {txHash, chain, orderId} = req.body;
    if(!txHash || !chain || !orderId){
      return res.status(BAD_REQUEST_CODE).json({message: "Invalid request"});
    }
    const result = await verifyTransactionByPayment(txHash, chain, orderId);
    if(result === null){
      return res.status(INTERNAL_ERROR_CODE).json({message: "Transaction not found"});
    }
    res.status(SUCCESS_CODE).send(result);
  }catch(err){
    return res.status(INTERNAL_ERROR_CODE).json({message: "Internal server error"});
  }
}