import apiClient from "@/lib/apiClient";
import { LoginDTO, RegisterDTO, User, AuthResponse } from "./types";
import { apiConfig } from "@/config/api";

export const authService = {
  async login(data: LoginDTO): Promise<AuthResponse> {
    const response = await apiClient.post(
      apiConfig.endpoints.auth.login,
      data
    );
    if (response.data.token) {
      localStorage.setItem("authToken", response.data.token);
    }
    return response.data;
  },

  async register(data: RegisterDTO): Promise<User> {
    const response = await apiClient.post(
      apiConfig.endpoints.auth.register,
      data
    );
    return response.data.user;
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get(apiConfig.endpoints.auth.me);
    return response.data.user;
  },

  logout(): void {
    localStorage.removeItem("authToken");
  },

  getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("authToken");
    }
    return null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
