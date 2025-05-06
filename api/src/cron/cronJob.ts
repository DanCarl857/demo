import cron from "node-cron";
import { fetchAndSyncMovies } from "../services/syncService";
import logger from "../utils/logger";
import { CRON_SCHEDULE } from "../constants";

cron.schedule(CRON_SCHEDULE, async () => {
  logger.info("[CRON]: Starting scheduled OMDb sync...");

  try {
    const count = await fetchAndSyncMovies();

    if (!count) {
      logger.info(`[CRON]: No new movies to sync...`);
    } else {
      logger.info(`[CRON]: ${count} movie(s) synced successfully.`);
    }
  } catch (error) {
    logger.error(`[CRON]: Sync failed - ${(error as Error).message}`);
  }
});
