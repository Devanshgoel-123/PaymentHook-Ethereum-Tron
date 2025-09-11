import { VerifyTraxnResult, VerifyPaymentResult } from "../utils/types";
import { MonitoringSessions } from "../db/schema";
import axios from "axios";
import { and, eq } from "drizzle-orm";
import { db } from "../db/db";
import { TronWeb } from "tronweb";
import { MonitoringStatus } from "../utils/enum";
import { amountMatches } from "./EthereumService";
import { USDT_DECIMALS } from "../utils/config";
import { findValueOfToken } from "./EthereumService";
/**
 * Track a transaction by hash
 * @param hash
 * @returns
 */

export const trackTransactionByHashEthereum = async (
  hash: string
): Promise<VerifyTraxnResult | null> => {
  try {
    const requestPayload = {
      jsonrpc: "2.0",
      method: "eth_getTransactionByHash",
      params: [hash],
      id: 1,
    };

    // Make the POST request using Axios
    const response = await axios.post(
      "https://docs-demo.quiknode.pro/",
      requestPayload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.error) {
      console.error("JSON-RPC error:", response.data.error.message);
      return null;
    }
    const object = response.data.result;
    const amount= findValueOfToken(object.input);

    return {
      verified: true,
      transaction: {
        hash: object.hash,
        from: object.from,
        to: amount?.receiver ? amount.receiver : "",
        amount: amount?.amount ? amount.amount.toString() : "0",
        token: "USDT",
        status: MonitoringStatus.Completed,
      },
    };
  } catch (err) {
    console.error("error tracking transaction by hash", err);
    return null;
  }
};

/**
 * Track a transaction by hash
 * @param hash
 * @param client
 * @returns
 */
export const trackTransactionByHashTron = async (
  hash: string,
  client: TronWeb | null
): Promise<VerifyTraxnResult | null> => {
  try {
    if (!client) {
      console.error("Client is not initialized");
      return null;
    }
    const tx = await client.trx.getTransaction(hash)
    const info = await client.trx.getTransactionInfo(hash);
    const transferLog = info.log?.[0];
    if (!transferLog || !transferLog.topics || transferLog.topics.length < 3) {
      return null;
    }

    const topics = transferLog.topics;
    const transferSig = 'ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
    if (topics[0] !== transferSig) {
      return null;
    }

    const fromHex = '41' + (topics[1] as string).slice(-40);
    const from = client.address.fromHex(fromHex);
    const toHex = '41' + (topics[2] as string).slice(-40);
    const to = client.address.fromHex(toHex);

    const amountWei = BigInt('0x' + transferLog.data);
    const divisor = BigInt(10 ** USDT_DECIMALS);
    const amountInt = amountWei / divisor;  // Integer part
    const amountDecimal = Number(amountWei % divisor) / (10 ** USDT_DECIMALS);  // Fractional part
    const amount = amountInt.toString() + '.' + amountDecimal.toFixed(USDT_DECIMALS).padStart(USDT_DECIMALS, '0');

    return {
      verified: true,
      transaction: {
        hash,
        from,
        to,
        amount,  // e.g., '2395.966508'
        token: 'USDT',
        status: info.receipt.result === 'SUCCESS' ? 'success' : 'failed'
      }
    };
  } catch (err) {
    console.error("error tracking transaction by hash", err);
    return null;
  }
};

/**
 * Verify a transaction by payment hash
 * @param txHash
 * @param chain
 * @param orderId
 * @returns
 */
export const verifyTransactionByPayment = async (
  txHash: string,
  chain: number,
  orderId: number
): Promise<VerifyPaymentResult | null> => {
  try {
    const session = await db
      .select()
      .from(MonitoringSessions)
      .where(
        and(
          eq(MonitoringSessions.txHash, txHash),
          eq(MonitoringSessions.chainId, chain),
          eq(MonitoringSessions.id, orderId)
        )
      );
    if (!session[0]) {
      return null;
    }
    const sessionObject = session[0];
    const result: VerifyPaymentResult = {
      verified: true,
      transaction: {
        hash: txHash,
        to: sessionObject.address,
        amount: sessionObject.amount,
        token: sessionObject.token,
        status: sessionObject.status,
      },
      payment_match: {
        expected: session[0].amount,
        received: session[0].receivedAmount,
        matches: amountMatches(
          Number(session[0].receivedAmount),
          Number(session[0].amount)
        ),
      },
    };
    return result;
  } catch (err) {
    console.error("error verifying transaction by payment", err);
    return null;
  }
};
