import { Router, Request, Response } from "express";
import { cleanupService } from "../services/cleanupService";

export const cleanupRouter = Router();

/**
 * GET /api/cleanup/stats
 * Get statistics about monitoring sessions
 */
cleanupRouter.get("/stats", async (req: Request, res: Response) => {
  try {
    const stats = await cleanupService.getSessionStats();
    res.json({
      success: true,
      data: stats,
      message: "Session statistics retrieved successfully"
    });
  } catch (error) {
    console.error("Error getting session stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve session statistics",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * POST /api/cleanup/manual
 * Manually trigger cleanup of expired monitoring sessions
 */
cleanupRouter.post("/manual", async (req: Request, res: Response) => {
  try {
    const expiredCount = await cleanupService.manualCleanup();
    res.json({
      success: true,
      data: { expiredCount },
      message: `Successfully expired ${expiredCount} monitoring sessions`
    });
  } catch (error) {
    console.error("Error during manual cleanup:", error);
    res.status(500).json({
      success: false,
      error: "Failed to perform manual cleanup",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});


