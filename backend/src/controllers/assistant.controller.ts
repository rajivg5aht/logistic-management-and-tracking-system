import { Response } from "express";
import { z } from "zod";
import { AssistantChatDTO } from "../dtos/assistant.dto";
import type { AuthRequest } from "../middleware/auth.middleware";
import { AssistantService } from "../services/assistant.service";
import { ApiResponseHelper } from "../utils/apihelper.util";

const assistantService = new AssistantService();

export class AssistantController {
  async chat(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return ApiResponseHelper.error(res, "Unauthorized", 401);

      const parsed = AssistantChatDTO.safeParse(req.body);
      if (!parsed.success) {
        return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
      }

      const result = await assistantService.chat(
        parsed.data.messages,
        req.user.role,
      );
      return ApiResponseHelper.success(
        res,
        result,
        "Assistant response generated successfully",
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }
}
