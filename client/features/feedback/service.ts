import apiClient from "@/lib/apiClient";
import { Feedback, CreateFeedbackDTO, UpdateFeedbackDTO } from "./types";
import { apiConfig } from "@/config/api";

export const feedbackService = {
  async getAllFeedback(): Promise<Feedback[]> {
    const response = await apiClient.get(apiConfig.endpoints.feedback.list);
    return response.data;
  },

  async getFeedbackById(id: string): Promise<Feedback> {
    const response = await apiClient.get(
      apiConfig.endpoints.feedback.getById(id)
    );
    return response.data;
  },

  async createFeedback(data: CreateFeedbackDTO): Promise<Feedback> {
    const response = await apiClient.post(
      apiConfig.endpoints.feedback.create,
      data
    );
    return response.data;
  },

  async updateFeedback(id: string, data: UpdateFeedbackDTO): Promise<Feedback> {
    const response = await apiClient.put(
      apiConfig.endpoints.feedback.update(id),
      data
    );
    return response.data;
  },

  async deleteFeedback(id: string): Promise<void> {
    await apiClient.delete(apiConfig.endpoints.feedback.delete(id));
  },
};
