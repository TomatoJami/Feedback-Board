import { Router, Request, Response } from "express";
import { FeedbackService } from "./service.js";
import { CreateFeedbackDTO, UpdateFeedbackDTO } from "./types.js";

const router = Router();

// Get all feedback
router.get("/", (_req: Request, res: Response) => {
  const feedback = FeedbackService.getAllFeedback();
  res.json(feedback);
});

// Get feedback by id
router.get("/:id", (req: Request, res: Response) => {
  const feedback = FeedbackService.getFeedbackById(req.params.id);
  if (!feedback) {
    return res.status(404).json({ error: "Feedback not found" });
  }
  res.json(feedback);
});

// Create feedback
router.post("/", (req: Request, res: Response) => {
  const { title, description, category, rating } = req.body;

  if (!title || !description || !category || rating === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const data: CreateFeedbackDTO = { title, description, category, rating };
  const feedback = FeedbackService.createFeedback(data);
  res.status(201).json(feedback);
});

// Update feedback
router.put("/:id", (req: Request, res: Response) => {
  const data: UpdateFeedbackDTO = req.body;
  const feedback = FeedbackService.updateFeedback(req.params.id, data);

  if (!feedback) {
    return res.status(404).json({ error: "Feedback not found" });
  }
  res.json(feedback);
});

// Delete feedback
router.delete("/:id", (req: Request, res: Response) => {
  const deleted = FeedbackService.deleteFeedback(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: "Feedback not found" });
  }
  res.json({ message: "Feedback deleted successfully" });
});

export default router;
