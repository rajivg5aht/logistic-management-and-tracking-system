import { Router } from "express";
import { InquiryController } from "../controllers/inquiry.controller";
import { adminMiddleware, authMiddleware } from "../middleware/auth.middleware";

const adminInquiryRouter = Router();
const inquiryController = new InquiryController();

adminInquiryRouter.use(authMiddleware);
adminInquiryRouter.use(adminMiddleware);
adminInquiryRouter.get("/", inquiryController.list);
adminInquiryRouter.get("/stats", inquiryController.stats);
adminInquiryRouter.get("/:id", inquiryController.getById);
adminInquiryRouter.patch("/:id", inquiryController.update);
adminInquiryRouter.put("/:id", inquiryController.update);
adminInquiryRouter.delete("/:id", inquiryController.delete);

export default adminInquiryRouter;
