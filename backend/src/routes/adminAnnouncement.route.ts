import { Router } from "express";
import { AnnouncementController } from "../controllers/announcement.controller";
import { adminMiddleware, authMiddleware } from "../middleware/auth.middleware";

const adminAnnouncementRouter = Router();
const announcementController = new AnnouncementController();

adminAnnouncementRouter.use(authMiddleware);
adminAnnouncementRouter.use(adminMiddleware);
adminAnnouncementRouter.get("/", announcementController.listAll);
adminAnnouncementRouter.post("/", announcementController.create);
adminAnnouncementRouter.delete("/:id", announcementController.delete);

export default adminAnnouncementRouter;
