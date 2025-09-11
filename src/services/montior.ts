import { MonitoringSessions } from "../db/schema";
import { db } from "../db/db";
import { and, eq } from "drizzle-orm";
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
  humanAmount: number,
  chainId:number
) => {
  try {
    const sessions = await db
      .select()
      .from(MonitoringSessions)
      .where(
        and(
          eq(MonitoringSessions.token, tokenAddress),
          eq(MonitoringSessions.status, "pending"),
          eq(MonitoringSessions.chainId, chainId)
        )
      );
    for (const session of sessions) {
        await updateOrderStatusInDB(session.id, hash, humanAmount, Number(session.amount));
    }
  } catch (err) {
    console.error("error completing merchant order tracking", err);
  }
};

/**
 * Update order status in DB
 * @param sessionId
 * @param hash
 * @param humanAmount
 * @returns
 */
export const updateOrderStatusInDB=async(sessionId:number, hash:string, receivedAmount:number, expectedAmount:number):Promise<boolean>=>{
  try{
    if (amountMatches(receivedAmount, expectedAmount)){
      const result=await db
      .update(MonitoringSessions)
      .set({
        status: "completed",
        updatedAt: new Date(),
        txHash: hash,
        receivedAmount: receivedAmount.toString(),
      })
      .where(eq(MonitoringSessions.id, sessionId)).returning();
      if(!result[0]){
        return false;
      }
      return true;
    }
    return false;
  }catch(err){
    console.error("error updating order status in DB", err);
    return false
  }
}

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


/**
 * Get all active sessions for a chain
 * @param chainId
 * @returns
 */
export const getActiveSessions = async (chainId: number) => {
  try {
    const sessions = await db
      .select()
      .from(MonitoringSessions)
      .where(eq(MonitoringSessions.chainId, chainId));
    return sessions;
  } catch (err) {
    console.error("error getting active sessions", err);
    return null;
  }
};

/**
 * Convert value to human format
 * @param valueInWei 
 * @returns 
 */
export const convertValuetoHumanFormat=(valueInWei:number):number | null=>{
  try{
    const decimals = 6; // For USDT
    const valueInToken = valueInWei / Math.pow(10, decimals);
    return valueInToken;
  }catch(err){
    console.error("error converting value to human format", err);
    return null;
  }
}