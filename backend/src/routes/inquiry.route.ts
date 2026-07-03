import { Router } from "express";
import { InquiryController } from "../controllers/inquiry.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const inquiryRouter = Router();
const inquiryController = new InquiryController();

inquiryRouter.post("/", inquiryController.create);
inquiryRouter.get("/my", authMiddleware, inquiryController.getMy);
inquiryRouter.post("/my", authMiddleware, inquiryController.createMy);

export default inquiryRouter;
