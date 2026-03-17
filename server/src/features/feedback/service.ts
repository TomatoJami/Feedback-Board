import { Feedback, CreateFeedbackDTO, UpdateFeedbackDTO } from "./types.js";
import { randomUUID } from "crypto";

// In-memory storage (replace with database in production)
const feedbackStore: Map<string, Feedback> = new Map();

export class FeedbackService {
  static getAllFeedback(): Feedback[] {
    return Array.from(feedbackStore.values());
  }

  static getFeedbackById(id: string): Feedback | undefined {
    return feedbackStore.get(id);
  }

  static createFeedback(data: CreateFeedbackDTO): Feedback {
    const id = randomUUID();
    const feedback: Feedback = {
      id,
      ...data,
      status: "open",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    feedbackStore.set(id, feedback);
    return feedback;
  }

  static updateFeedback(id: string, data: UpdateFeedbackDTO): Feedback | undefined {
    const feedback = feedbackStore.get(id);
    if (!feedback) return undefined;

    const updated: Feedback = {
      ...feedback,
      ...data,
      updatedAt: new Date(),
    };
    feedbackStore.set(id, updated);
    return updated;
  }

  static deleteFeedback(id: string): boolean {
    return feedbackStore.delete(id);
  }
}
