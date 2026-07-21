import { Router } from "express";
import { AssistantController } from "../controllers/assistant.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const assistantRouter = Router();
const assistantController = new AssistantController();

assistantRouter.use(authMiddleware);
assistantRouter.post("/chat", assistantController.chat);

export default assistantRouter;
