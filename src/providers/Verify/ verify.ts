import { Request, Response } from "express";
import { trackTransactionByHashEthereum, trackTransactionByHashTron } from "../../services/verify";
import { INTERNAL_ERROR_CODE, SUCCESS_CODE } from "../../utils/constants";
import { verifyTransactionByPayment } from "../../services/verify";
import { BAD_REQUEST_CODE,  } from "../../utils/constants";
import { CHAIN_ID_ETHEREUM } from "../../utils/config";
import { tronProvider } from "../..";
/**
 * Verify a transaction
 * @param req
 * @param res
 * @returns
 */
export const verifyTransactionByHash = async (req: Request, res: Response) => {
  try {
    const { hash, chainId } = req.body;
    if(!hash || !chainId){
      return res.status(BAD_REQUEST_CODE).json({message: "Invalid request"});
    }
    const result = chainId === CHAIN_ID_ETHEREUM ? await trackTransactionByHashEthereum(hash) : await trackTransactionByHashTron(hash, tronProvider.client);
    if(result === null){
      return res.status(INTERNAL_ERROR_CODE).json({message: "Transaction not found"});
    }
    res.status(SUCCESS_CODE).send(result);
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
    const {hash, chain, orderId} = req.body;
    if(!hash || !chain || !orderId){
      return res.status(BAD_REQUEST_CODE).json({message: "Invalid request"});
    }
    const result = await verifyTransactionByPayment(hash, chain, orderId);
    if(result === null){
      return res.status(INTERNAL_ERROR_CODE).json({message: "Transaction not found"});
    }
    res.status(SUCCESS_CODE).send(result);
  }catch(err){
    return res.status(INTERNAL_ERROR_CODE).json({message: "Internal server error"});
  }
}