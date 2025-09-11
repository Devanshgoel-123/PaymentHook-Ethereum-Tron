import { cleanupService } from "../src/services/cleanupService";
import { db } from "../src/db/db";
import { MonitoringStatus } from "../src/utils/enum";
import { MonitoringSessions } from "../src/db/schema";

// Mock console methods to avoid noise in tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

beforeEach(async () => {
  // Insert test sessions
  const result = await db.insert(MonitoringSessions).values([
    {
      address: "0x123",
      status: MonitoringStatus.Monitoring,
      createdAt: new Date(Date.now() - 86400000), // 1 day ago -> expired
      chainId: 1,
      amount: "100",
      receivedAmount: "0",
      token: "USDT",
      txHash: "0x123",
    },
    {
      address: "0x456",
      status: MonitoringStatus.Monitoring,
      createdAt: new Date(), // not expired
      chainId: 1,
      amount: "100",
      receivedAmount: "0",
      token: "USDT",
      txHash: "0x456",
    },
  ]).returning();
  console.log("result", result);
});

afterEach(async () => {
  // Clean up all test sessions
  await db.delete(MonitoringSessions);
});

describe("CleanupService", () => {
  describe("manualCleanup", () => {
    it("should return count of expired sessions when they exist", async () => {
      const result = await cleanupService.manualCleanup();
      expect(result).toBe(1); // Only the first session is expired
    });

    it("should return 0 when no expired sessions exist", async () => {
      // Delete all sessions first
      await db.delete(MonitoringSessions);

      const result = await cleanupService.manualCleanup();
      expect(result).toBe(0);
    });
  });

  describe("getSessionStats", () => {
    it("should return correct statistics", async () => {
      const stats = await cleanupService.getSessionStats();
      expect(stats).toEqual({
        total: 2,
        monitoring: 2,
        completed: 0,
        expired: 0,
      });
    });
  });
});
