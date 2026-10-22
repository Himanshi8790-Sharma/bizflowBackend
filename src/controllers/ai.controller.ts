import type { Request, Response } from "express";
import { ZodError } from "zod";

import { aiQuerySchema } from "../validators/ai.validator.js";
import { aiService } from "../services/ai.service.js";

export const aiController = {
  async askQuestion(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      const { question } = aiQuerySchema.parse(req.body);

      const result = await aiService.askQuestion(
        question,
        user.organizationId,
        user.userId,
      );

      res.status(200).json({
        success: true,
        message: "AI response generated successfully",
        data: result,
      });
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: "Invalid request",
          errors: error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        });
        return;
      }

      if (
        error instanceof Error &&
        error.message === "GEMINI_API_KEY is not configured"
      ) {
        res.status(500).json({
          success: false,
          message: "AI service is not configured",
        });
        return;
      }

     console.error("AI_CONTROLLER_ERROR:", error);

const status =
  typeof error === "object" &&
  error !== null &&
  "status" in error &&
  typeof error.status === "number"
    ? error.status
    : 500;

if (status === 503 || status === 429) {
  res.status(503).json({
    success: false,
    message: "AI is temporarily busy. Please try again in a few moments.",
  });
  return;
}

res.status(500).json({
  success: false,
  message: "Failed to generate AI response. Please try again.",
});
    }
  },
};