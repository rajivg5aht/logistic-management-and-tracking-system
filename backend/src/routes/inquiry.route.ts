import { Router } from "express";
import { InquiryController } from "../controllers/inquiry.controller";

const inquiryRouter = Router();
const inquiryController = new InquiryController();

inquiryRouter.post("/", inquiryController.create);

export default inquiryRouter;
