// Feedback Types
export interface Feedback {
  id: string;
  title: string;
  description: string;
  category: string;
  rating: number;
  status: "open" | "in-progress" | "completed";
  createdAt: string;
  updatedAt: string;
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
