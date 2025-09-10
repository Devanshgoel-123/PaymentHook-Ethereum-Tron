import { MonitoringSessions } from "../db/schema";
import { db } from "../db/db";
import { and, eq } from "drizzle-orm";
import { findValueOfToken } from "./EthereumService";
import { amountMatches } from "./EthereumService";
/**
 * Create a monitoring session for an address
 * @param address
 */
export const createMontioringSessionForAddress = async (
  address: string,
  amount: string,
  token: string,
  chain: number
): Promise<number | null> => {
  try {
    const session = await db
      .insert(MonitoringSessions)
      .values({
        address: address,
        amount: amount,
        token: token,
        chainId: chain,
        txHash: "",
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
        receivedAmount: "0",
      })
      .returning();
    if (!session[0]) {
      return null;
    }
    return session[0].id;
  } catch (err) {
    console.error("error creating monitoring session", err);
    return null;
  }
};

/**
 * Complete merchant order tracking
 * @param hash
 */
export const completeMerchantOrderTracking = async (
  hash: string,
  tokenAddress: string,
  input: string
) => {
  try {
    const humanAmount = await findValueOfToken(input);
    if (!humanAmount) {
      console.error("error finding value of token in human format");
      return;
    }
    const sessions = await db
      .select()
      .from(MonitoringSessions)
      .where(
        and(
          eq(MonitoringSessions.token, tokenAddress),
          eq(MonitoringSessions.status, "pending")
        )
      );
    for (const session of sessions) {
      if (amountMatches(humanAmount, Number(session.amount))) {
        await db
          .update(MonitoringSessions)
          .set({
            status: "completed",
            updatedAt: new Date(),
            txHash: hash,
            receivedAmount: humanAmount.toString(),
          })
          .where(eq(MonitoringSessions.id, session.id));
      }
    }
  } catch (err) {
    console.error("error completing merchant order tracking", err);
  }
};

/**
 * Get the status of a merchant order
 * @param sessionId
 * @returns
 */
export const getMerchantOrderStatus = async (
  sessionId: number
): Promise<string | null> => {
  try {
    const session = await db
      .select()
      .from(MonitoringSessions)
      .where(eq(MonitoringSessions.id, sessionId));
    const sessionObject = session[0];
    if (!sessionObject) {
      return null;
    }
    return sessionObject.status;
  } catch (err) {
    console.error("error getting merchant order status", err);
    return null;
  }
};
