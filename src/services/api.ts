// Frontend API Client connected to Node.js / Express Backend
const API_BASE_URL = 'http://localhost:5000/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('lexora_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('lexora_token', token);
}

export function removeAuthToken() {
  localStorage.removeItem('lexora_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
    }

    return (await res.json()) as T;
  } catch (error) {
    console.warn(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Auth
  login: (credentials: { email?: string; password?: string; role?: string }) =>
    request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  getCurrentUser: () => request<{ user: any }>('/auth/me'),

  // Cases
  getCases: (params?: { status?: string; division?: string; priority?: string; search?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<any[]>(`/cases${query ? `?${query}` : ''}`);
  },

  getCaseById: (id: string) => request<any>(`/cases/${id}`),

  createCase: (caseData: any) =>
    request<any>('/cases', {
      method: 'POST',
      body: JSON.stringify(caseData),
    }),

  updateCase: (id: string, caseData: any) =>
    request<any>(`/cases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(caseData),
    }),

  deleteCase: (id: string) =>
    request<any>(`/cases/${id}`, {
      method: 'DELETE',
    }),

  // AI Features
  analyzeCase: (data: { caseId?: string; fileName?: string }) =>
    request<any>('/ai/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  chatAi: (data: { message: string; caseId?: string }) =>
    request<any>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  predictDelay: (data: any) =>
    request<any>('/ai/predict-delay', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Analytics
  getAnalytics: () => request<any>('/analytics/dashboard'),

  // Hearings
  getHearings: () => request<any[]>('/hearings'),

  // Documents Upload
  uploadDocument: async (file: File, caseId?: string) => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('file', file);
    if (caseId) formData.append('caseId', caseId);

    const res = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!res.ok) throw new Error('File upload failed');
    return await res.json();
  },
};
