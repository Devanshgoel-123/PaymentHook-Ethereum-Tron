import {
  trackTransactionByHashEthereum,
  trackTransactionByHashTron,
  verifyTransactionByPayment,
} from "../src/services/verify";
import axios from "axios";
import { MonitoringStatus } from "../src/utils/enum";
import { CHAIN_ID_ETHEREUM } from "../src/utils/config";
import { db } from "../src/db/db";
import { MonitoringSessions } from "../src/db/schema";
// Mock axios for external API call
// Mock TronWeb
jest.mock("tronweb");

describe("Transaction Verification", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  jest.mock("axios");
  const mockedAxios = axios as jest.Mocked<typeof axios>;

    test("Should verify valid Ethereum USDT transaction", async () => {
      // Mock successful Ethereum transaction response
      const mockEthereumResponse = {
        data: {
          result: {
            hash: "0xeca0c99178f506689afab09817fe3191c6e8049e0faaf34078c3747c34bfdf33",
            from: "0x05D9617595E69Ff577076355ABC5e7c51eD0bdF3",
            to: "0xBEAb87C4fC6B5D65BD48Fa3Ed5BbcaE9b3738785",
            value: "1742.715319",
            blockNumber: "0x1642796",
          },
        },
      };

      const txHash =
        "0xeca0c99178f506689afab09817fe3191c6e8049e0faaf34078c3747c34bfdf33";
      const response = await mockedAxios.post(
        "http://localhost:3000/api/verify/transaction",
        {
          hash: txHash,
          chainId: 1,
        }
      );
      const result = response.data;
      expect(result?.verified).toBe(true);
      expect(result?.transaction.hash).toBe(txHash);
      expect(result?.transaction.from.toLowerCase()).toBe(
        "0x05d9617595e69ff577076355abc5e7c51ed0bdf3"
      );
      expect(result?.transaction.to.toLowerCase()).toBe(
        "0xbeab87c4fc6b5d65bd48fa3ed5bbcae9b3738785"
      );
      expect(result?.transaction.amount).toBe("1742.715319");
      expect(result?.transaction.token).toBe("USDT");
      expect(result?.transaction.status).toBe(MonitoringStatus.Completed);
    });

    test("Should verify valid Tron USDT transaction", async () => {
      const txHash =
        "0xcdd6f94f4943dd4508f79fcbffa897aeec475ce5d12a29a27cecfaca4f0497f4";
      const result = await mockedAxios.post(
        "http://localhost:3000/api/verify/transaction",
        {
          hash: txHash,
          chainId: 2,
        }
      );
      const dataObject = result.data;
      expect(dataObject.verified).toBe(true);
      expect(dataObject.transaction.hash).toBe(txHash);
      expect(dataObject.transaction.from).toBe(
        "TEoiKu7sbpb4J6mp9d2DRNS95tPGUU8qMD"
      );
      expect(dataObject.transaction.to).toBe(
        "TDqSquXBgUCLYvYC4XZgrprLK589dkhSCf"
      );
      expect(dataObject.transaction.amount).toBe("811.0.780871");
      expect(dataObject.transaction.token).toBe("USDT");
      expect(dataObject.transaction.status).toBe("success");
    });

  test("Should match verified tx to expected payment", async () => {

    const txHash =
      "0x49410dce7f81df854e54d0e7ff17e2a67d370709f11fa4d2484e574a88096966";
    const chainId = CHAIN_ID_ETHEREUM;
    const orderId = 18;

    const data2 = await mockedAxios.post(
      "http://localhost:3000/api/verify/payment",
      {
        hash: txHash,
        chain: chainId,
        orderId: orderId,
      }
    );

    const result = data2.data;
    expect(result?.verified).toBe(true);
    expect(result?.transaction.hash).toBe(txHash);
    expect(result?.transaction.to).toBe(
      "0xa9a952cf28b0cacca51452da444163bb6be7f500"
    );
    expect(result?.transaction.amount).toBe("0.1");
    expect(result?.transaction.status).toBe(MonitoringStatus.Completed);
    expect(result?.payment_match.expected).toBe("0.1");
    expect(result?.payment_match.received).toBe("0.1");
    expect(result?.payment_match.matches).toBe(true);

    // Test with non-existent session
    const resultNotFound = await verifyTransactionByPayment(
      "0x2F60554FADA00a128e53b055a5eBfeFe6Fc2D53b",
      CHAIN_ID_ETHEREUM,
      999
    );

    expect(resultNotFound).toBeNull();
  });
});
