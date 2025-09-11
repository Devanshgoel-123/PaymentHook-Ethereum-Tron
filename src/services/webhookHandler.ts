import { completeMerchantOrderTracking } from "../services/montior";
import { CHAIN_ID_ETHEREUM, USDT_DECIMALS } from "../utils/config";
import { trackTransactionByHashEthereum } from "./verify";
import { decodeTransferLog } from "./EthereumService";
/**
 * Complete merchant order tracking
 * @param req
 * @param res
 * @returns
 */
export const CompleteMerchantOrderTracking = async (
  matchingTransactions: any
) => {
  try {
    const result = await Promise.all(
      matchingTransactions.map(async (item: any) => {
        const hash = item.transactionHash;
        const transaction = await trackTransactionByHashEthereum(hash);
        const logs = item.logs[0];
        const decodedLog = decodeTransferLog(logs, USDT_DECIMALS);
        if (!transaction?.transaction.to || !decodedLog?.to) {
          return false;
        }
        const chainId = CHAIN_ID_ETHEREUM;
        const humanAmount = decodedLog?.amount;
        const receiver = decodedLog?.to;
        if (!humanAmount || !receiver) {
          console.error("error finding value of token in human format");
          return false;
        }
        return await completeMerchantOrderTracking(
          hash,
          transaction?.transaction.to,
          parseFloat(humanAmount),
          chainId,
          receiver
        );
      })
    );
    return true;
  } catch (err) {
    return false;
  }
};


