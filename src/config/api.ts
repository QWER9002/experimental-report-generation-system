export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  REPORTS: `${API_BASE_URL}/api/reports`,
  GENERATE_REPORT: `${API_BASE_URL}/api/generate-report`,
}