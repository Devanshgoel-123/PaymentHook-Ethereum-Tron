import { MonitoringSessions } from "../db/schema";
import { db } from "../db/db";
import { and, eq, lt } from "drizzle-orm";
import { MonitoringStatus } from "../utils/enum";

/**
 * Cleanup service to automatically remove expired monitoring sessions
 * 
 * This service runs every minute and removes monitoring sessions that:
 * - Are older than 5 minutes (configurable via SESSION_TIMEOUT_MS)
 * - Are still in "monitoring" status
 * 
 * Instead of deleting the sessions, they are marked as "expired" to maintain
 * audit trail and historical data.
 * 
 * Features:
 * - Automatic cleanup every minute
 * - Manual cleanup trigger
 * - Session statistics
 * - Graceful shutdown handling
 * - Comprehensive logging
 */
export class CleanupService {
  private static readonly CLEANUP_INTERVAL_MS = 60000; // Run every minute
  private static readonly SESSION_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes in milliseconds
  private cleanupInterval: NodeJS.Timeout | null = null;

  /**
   * Start the cleanup service
   */
  public start(): void {
    console.log("Starting cleanup service...");
    this.performCleanup();
    
    // Schedule periodic cleanup
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, CleanupService.CLEANUP_INTERVAL_MS);
    
    console.log(`Cleanup service started. Running every ${CleanupService.CLEANUP_INTERVAL_MS / 1000} seconds`);
  }

  /**
   * Stop the cleanup service
   */
  public stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log("Cleanup service stopped");
    }
  }

  /**
   * Perform the actual cleanup of expired monitoring sessions
   */
  private async performCleanup(): Promise<void> {
    try {
      const cutoffTime = new Date(Date.now() - CleanupService.SESSION_TIMEOUT_MS);
      
      // Find sessions that are older than 5 minutes and still monitoring
      const expiredSessions = await db
        .select()
        .from(MonitoringSessions)
        .where(
          and(
            eq(MonitoringSessions.status, MonitoringStatus.Monitoring),
            lt(MonitoringSessions.createdAt, cutoffTime)
          )
        );

      if (expiredSessions.length === 0) {
        console.log("No expired monitoring sessions found");
        return;
      }

      console.log(`Found ${expiredSessions.length} expired monitoring sessions`);

      // Update expired sessions to expired status
      const updateResult = await db
        .update(MonitoringSessions)
        .set({
          status: MonitoringStatus.Expired,
          updatedAt: new Date()
        })
        .where(
          and(
            eq(MonitoringSessions.status, MonitoringStatus.Monitoring),
            lt(MonitoringSessions.createdAt, cutoffTime)
          )
        )
        .returning();

      console.log(`Successfully expired ${updateResult.length} monitoring sessions`);
      
      // Log details of expired sessions for debugging
      updateResult.forEach(session => {
        console.log(`Expired session ID: ${session.id}, Address: ${session.address}, Created: ${session.createdAt}`);
      });

    } catch (error) {
      console.error("Error during cleanup of monitoring sessions:", error);
    }
  }

  /**
   * Manually trigger cleanup (useful for testing or manual operations)
   */
  public async manualCleanup(): Promise<number> {
    try {
      const cutoffTime = new Date(Date.now() - CleanupService.SESSION_TIMEOUT_MS);
      
      const updateResult = await db
        .update(MonitoringSessions)
        .set({
          status: MonitoringStatus.Expired,
          updatedAt: new Date()
        })
        .where(
          and(
            eq(MonitoringSessions.status, MonitoringStatus.Monitoring),
            lt(MonitoringSessions.createdAt, cutoffTime)
          )
        )
        .returning();

      console.log(`Manual cleanup completed. Expired ${updateResult.length} sessions`);
      return updateResult.length;
    } catch (error) {
      console.error("Error during manual cleanup:", error);
      throw error;
    }
  }

  /**
   * Get statistics about monitoring sessions
   */
  public async getSessionStats(): Promise<{
    total: number;
    monitoring: number;
    completed: number;
    expired: number;
  }> {
    try {
      const allSessions = await db.select().from(MonitoringSessions);
      
      const stats = {
        total: allSessions.length,
        monitoring: allSessions.filter(s => s.status === MonitoringStatus.Monitoring).length,
        completed: allSessions.filter(s => s.status === MonitoringStatus.Completed).length,
        expired: allSessions.filter(s => s.status === MonitoringStatus.Expired).length,
      };

      return stats;
    } catch (error) {
      console.error("Error getting session stats:", error);
      throw error;
    }
  }
}

// Export a singleton instance
export const cleanupService = new CleanupService();
