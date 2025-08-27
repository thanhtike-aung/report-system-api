import { Router } from "express";
import { getCronJobsStatus } from "../services/scheduler/jobs";
import { createSuccessResponse } from "../types/common/apiResponse";
import authMiddleware from "../middlewares/authMiddleware";

export const setSystemRoutes = (app: Router): void => {
  // Health check endpoint (public)
  app.get("/health", (req, res) => {
    const response = createSuccessResponse(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || "unknown",
      },
      "System is healthy",
    );

    res.status(200).json(response);
  });

  // Cron jobs status endpoint (protected)
  app.get("/system/cron-status", authMiddleware, (_req, res) => {
    try {
      const cronJobsStatus = getCronJobsStatus();
      const response = createSuccessResponse(
        cronJobsStatus,
        "Cron jobs status retrieved",
      );
      res.status(200).json(response);
    } catch (error) {
      const response = createSuccessResponse(
        [],
        "Failed to retrieve cron jobs status",
      );
      res.status(500).json(response);
    }
  });
};
