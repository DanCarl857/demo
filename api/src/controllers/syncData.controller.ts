import { Request, Response } from "express";
import logger from "../utils/logger";
import { fetchAndSyncMovies } from "../services/syncService";

const syncData = async (_: Request, res: Response) => {
  try {
    const count = await fetchAndSyncMovies();

    res.json({
      message: `[SERVER]: ${count} movie(s) synced successfully.`,
    });
  } catch (error) {
    logger.error(`[SERVER]: Error syncing data - ${(error as Error).message}`);
    res.status(500).json({
      message: "Failed to sync data",
      error: (error as Error).message,
    });
  }
};

export default syncData;
