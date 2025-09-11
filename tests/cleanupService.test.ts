import { cleanupService } from "../src/services/cleanupService";
import { db } from "../src/db/db";
import { MonitoringStatus } from "../src/utils/enum";

// Mock the database
jest.mock("../src/db/db", () => ({
  db: {
    select: jest.fn(),
    update: jest.fn(),
  },
}));

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

describe("CleanupService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanupService.stop();
  });

  describe("manualCleanup", () => {
    it("should return 0 when no expired sessions exist", async () => {
      // Mock database response for no expired sessions
      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      const mockUpdate = jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      (db as any).select = mockSelect;
      (db as any).update = mockUpdate;

      const result = await cleanupService.manualCleanup();
      expect(result).toBe(0);
    });

    it("should return count of expired sessions when they exist", async () => {
      const mockExpiredSessions = [
        { id: 1, address: "0x123", status: MonitoringStatus.Monitoring },
        { id: 2, address: "0x456", status: MonitoringStatus.Monitoring },
      ];

      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(mockExpiredSessions),
        }),
      });

      const mockUpdate = jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue(mockExpiredSessions),
          }),
        }),
      });

      (db as any).select = mockSelect;
      (db as any).update = mockUpdate;

      const result = await cleanupService.manualCleanup();
      expect(result).toBe(2);
    });

    it("should handle database errors gracefully", async () => {
      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockRejectedValue(new Error("Database error")),
        }),
      });

      (db as any).select = mockSelect;

      await expect(cleanupService.manualCleanup()).rejects.toThrow("Database error");
    });
  });

  describe("getSessionStats", () => {
    it("should return correct statistics", async () => {
      const mockSessions = [
        { id: 1, status: MonitoringStatus.Monitoring },
        { id: 2, status: MonitoringStatus.Monitoring },
        { id: 3, status: MonitoringStatus.Completed },
        { id: 4, status: MonitoringStatus.Expired },
        { id: 5, status: MonitoringStatus.Expired },
      ];

      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockResolvedValue(mockSessions),
      });

      (db as any).select = mockSelect;

      const stats = await cleanupService.getSessionStats();
      expect(stats).toEqual({
        total: 5,
        monitoring: 2,
        completed: 1,
        expired: 2,
      });
    });

    it("should handle database errors gracefully", async () => {
      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockRejectedValue(new Error("Database error")),
      });

      (db as any).select = mockSelect;

      await expect(cleanupService.getSessionStats()).rejects.toThrow("Database error");
    });
  });

  describe("start and stop", () => {
    it("should start and stop the cleanup service", () => {
      // Mock setInterval and clearInterval
      const mockSetInterval = jest.fn();
      const mockClearInterval = jest.fn();
      
      global.setInterval = mockSetInterval;
      global.clearInterval = mockClearInterval;

      cleanupService.start();
      expect(mockSetInterval).toHaveBeenCalled();

      cleanupService.stop();
      expect(mockClearInterval).toHaveBeenCalled();
    });
  });
});
