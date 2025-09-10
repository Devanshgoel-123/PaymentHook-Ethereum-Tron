import { Request, Response } from "express";
import { trackTransactionByHash } from "../../services/verify";
import { INTERNAL_ERROR_CODE } from "../../utils/constants";
/**
 * Verify a transaction
 * @param req
 * @param res
 * @returns
 */
export const verifyTransaction = async (req: Request, res: Response) => {
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
