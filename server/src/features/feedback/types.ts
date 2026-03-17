// Feedback Types
export interface Feedback {
  id: string;
  title: string;
  description: string;
  category: string;
  rating: number;
  status: "open" | "in-progress" | "completed";
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
}

export interface CreateFeedbackDTO {
  title: string;
  description: string;
  category: string;
  rating: number;
}

export interface UpdateFeedbackDTO {
  title?: string;
  description?: string;
  category?: string;
  rating?: number;
  status?: "open" | "in-progress" | "completed";
}
