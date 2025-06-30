import {
  getAdaptiveCardMessages,
  getAdaptiveCardMessagesWithType,
} from "../controllers/adaptiveCardMessage/adaptiveCardMessageController";
import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";

export const setAdaptiveCardMessageRoutes = (app: Router) => {
  app.use(authMiddleware);

  app.get("/cardmessages", getAdaptiveCardMessages);
  app.get("/cardmessages/:type", getAdaptiveCardMessagesWithType);
};
