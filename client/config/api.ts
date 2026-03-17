// Environment variables for API communication
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export const apiConfig = {
  baseURL: API_BASE_URL,
  endpoints: {
    feedback: {
      list: `${API_BASE_URL}/feedback`,
      create: `${API_BASE_URL}/feedback`,
      getById: (id: string) => `${API_BASE_URL}/feedback/${id}`,
      update: (id: string) => `${API_BASE_URL}/feedback/${id}`,
      delete: (id: string) => `${API_BASE_URL}/feedback/${id}`,
    },
    auth: {
      login: `${API_BASE_URL}/auth/login`,
      register: `${API_BASE_URL}/auth/register`,
      me: `${API_BASE_URL}/auth/me`,
    },
  },
};
