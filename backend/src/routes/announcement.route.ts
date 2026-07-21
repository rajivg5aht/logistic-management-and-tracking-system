import { Router } from "express";
import { AnnouncementController } from "../controllers/announcement.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const announcementRouter = Router();
const announcementController = new AnnouncementController();

announcementRouter.use(authMiddleware);
announcementRouter.get("/", announcementController.listForCurrentUser);

export default announcementRouter;
