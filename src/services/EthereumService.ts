import axios from "axios";
import { BASE_QUICK_NODE_URL, TEMPLATE_ID } from "../utils/constants";
import { ethers, N } from "ethers";
import { config } from "dotenv";
import { convertValuetoHumanFormat } from "./montior";
import { db } from "../db/db";
import { activeUsers } from "../db/schema";
import { and, eq } from "drizzle-orm";
import { CHAIN_ID_ETHEREUM } from "../utils/config";
import { sql } from "drizzle-orm";

config();
const QUICKNODE_ETHEREUM_HEADERS = {
  accept: "application/json",
  "Content-Type": "application/json",
  "x-api-key": `${process.env.QUICK_NODE_API_KEY}`,
};

const QUICKNODE_ETHEREUM_PAYLOAD = {
  name: "My Wallet Monitor Webhook",
  network: "ethereum-mainnet",
  notification_email: "devanshgoel112233@gmail.com",
  destination_attributes: {
    url: `${process.env.BACKEND_URL}/api/webhook/webhookUpdate`,
    compression: "gzip",
  },
  status: "active",
  templateArgs: {
    wallets: [],
  },
};

/**
 *
 * @param address
 */
export const registerWebhook = async () => {
  try {
    const url = `${BASE_QUICK_NODE_URL}/webhooks/rest/v1/webhooks/template/${TEMPLATE_ID}`;
    const result = await axios.post(url, QUICKNODE_ETHEREUM_PAYLOAD, {
      headers: QUICKNODE_ETHEREUM_HEADERS,
    });
    return result.data.id as string;
  } catch (err) {
    console.error("Error:", err);
  }
};

/**
 * Update a webhook
 */
export const updateWebhook = async (
  userAddress: string,
  webhookId: string
): Promise<boolean> => {
  try {
    const activeUsers = await findActiveUsersAndInsertInDB(CHAIN_ID_ETHEREUM);
    const existingUser = activeUsers?.find(
      (user) => user.address.toLowerCase() === userAddress.toLowerCase()
    );
    let wallets: string[] =
      activeUsers?.map((user) => user.address.toLowerCase()) || [];
    if (existingUser) {
      await incrementUserCountInDB(
        existingUser.address.toLowerCase(),
        CHAIN_ID_ETHEREUM
      );
      return true;
    } else {
      wallets.push(userAddress.toLowerCase());
      await insertUserInDB(userAddress.toLowerCase(), CHAIN_ID_ETHEREUM, 1);
    }
    const url = `${BASE_QUICK_NODE_URL}/webhooks/rest/v1/webhooks/${webhookId}/template/${TEMPLATE_ID}`;
    if (wallets.length > 0) {
      const updatePayload = {
        ...QUICKNODE_ETHEREUM_PAYLOAD,
        templateArgs: {
          wallets: wallets,
        },
      };
      const result = await axios.patch(url, updatePayload, {
        headers: QUICKNODE_ETHEREUM_HEADERS,
      });
      return true;
    }
    return true;
  } catch (err) {
    console.error("Error:", err);
    return false;
  }
};

/**
 * Pause a webhook
 * @param webhookId
 * @returns
 */
export const pauseWebhook = async (webhookId: string) => {
  try {
    const url = `${BASE_QUICK_NODE_URL}/webhooks/rest/v1/webhooks/${webhookId}/pause`;
    const result = await axios.post(
      url,
      { status: "paused" },
      { headers: QUICKNODE_ETHEREUM_HEADERS }
    );
    return result.data.id as string;
  } catch (err) {
    console.error("Error:", err);
  }
};

/**
 * Start a webhook
 * @param webhookId
 * @returns
 */
export const startWebhook = async (webhookId: string) => {
  try {
    const url = `${BASE_QUICK_NODE_URL}/webhooks/rest/v1/webhooks/${webhookId}/activate`;
    const payload = {
      startFrom: "last",
    };
    const result = await axios.post(url, payload, {
      headers: QUICKNODE_ETHEREUM_HEADERS,
    });
    return true;
  } catch (err) {
    return false;
  }
};

export const deleteWebhook = async (webhookId: string) => {
  try {
    const url = `${BASE_QUICK_NODE_URL}/webhooks/rest/v1/webhooks/${webhookId}`;
    const result = await axios.delete(url, {
      headers: QUICKNODE_ETHEREUM_HEADERS,
    });
    return result.data.id as string;
  } catch (err) {
    console.error("Error:", err);
  }
};

export const GetWebhookInfo = async (webhookId: string) => {
  try {
    const url = `${BASE_QUICK_NODE_URL}/webhooks/rest/v1/webhooks/${webhookId}`;
    const result = await axios.get(url, {
      headers: QUICKNODE_ETHEREUM_HEADERS,
    });
    return result.data.destination_attributes;
  } catch (err) {
    console.error("Error:", err);
  }
};
/**
 * Find the value of a token
 * @param input
 * @returns
 */
export const findValueOfToken = (
  input: string
): { amount: number | null; receiver: string } | null => {
  try {
    const iface = new ethers.Interface([
      "function transfer(address to, uint256 value)",
    ]);
    const decoded = iface.decodeFunctionData("transfer", input);
    const valueInWei = decoded.value.toString(); // 300,000 (smallest units
    const valueInToken = convertValuetoHumanFormat(valueInWei);
    return {
      amount: valueInToken,
      receiver: decoded.to,
    };
  } catch (err) {
    console.error("Error:", err);
    return null;
  }
};

/**
 * Check if the amount matches
 * @param received
 * @param expected
 * @param tolerancePct
 * @returns
 */
export const amountMatches = (
  received: number,
  expected: number,
  tolerancePct = 2
): boolean => {
  const diff = Math.abs(received - expected);
  return diff <= expected * (tolerancePct / 100);
};

/**
 * Find active users and insert in DB to update webhook addresses
 * @param chainId
 * @param userAddress
 * @returns
 */
export const findActiveUsersAndInsertInDB = async (chainId: number) => {
  try {
    const activeUsersInDb = await db
      .select()
      .from(activeUsers)
      .where(
        and(eq(activeUsers.chainId, chainId), eq(activeUsers.status, "active"))
      );
    if (activeUsersInDb.length > 0) {
      return activeUsersInDb;
    }
    return null;
  } catch (err) {
    console.error("Error:", err);
    return null;
  }
};

/**
 * Increment user count in DB
 * @param address
 * @param chainId
 */
export const incrementUserCountInDB = async (
  address: string,
  chainId: number
) => {
  try {
    await db
      .update(activeUsers)
      .set({
        count: sql`${activeUsers.count} + 1`,
      })
      .where(
        and(eq(activeUsers.address, address), eq(activeUsers.chainId, chainId))
      );
  } catch (err) {
    console.error("Error incrementing user count:", err);
    throw err;
  }
};

/**
 * Decrement user count in DB
 * @param address
 * @param chainId
 */
export const decrementUserCountInDB = async (
  address: string,
  chainId: number
) => {
  try {
    await db
      .update(activeUsers)
      .set({
        count: sql`${activeUsers.count} - 1`,
        status: sql`CASE WHEN ${activeUsers.count} = 1 THEN 'inactive' ELSE ${activeUsers.status} END`,
      })
      .where(
        and(eq(activeUsers.address, address), eq(activeUsers.chainId, chainId))
      );
  } catch (err) {
    console.error("Error decrementing user count:", err);
    throw err;
  }
};

/**
 * Insert user in DB
 * @param address
 * @param chainId
 * @param count
 */
export const insertUserInDB = async (
  address: string,
  chainId: number,
  count: number = 1
) => {
  try {
    await db.insert(activeUsers).values({
      address,
      chainId,
      count,
      status: "active",
    });
  } catch (err) {
    console.error("Error inserting user:", err);
    throw err;
  }
};


/**
 * Decode transfer log
 * @param log
 * @param decimals
 * @returns
 */
export const decodeTransferLog = (
  log: {
    topics: string[];
    data: string;
  },
  decimals: number
) => {
  if (!log || !log.topics || log.topics.length < 3) {
    throw new Error("Invalid log: missing topics");
  }
  const from = "0x" + log.topics[1]?.slice(-40);
  const to = "0x" + log.topics[2]?.slice(-40);
  const rawAmount: bigint = log.data ? BigInt(log.data) : 0n;
  const amount = ethers.formatUnits(rawAmount, decimals);
  return { from, to, amount, rawAmount };
};