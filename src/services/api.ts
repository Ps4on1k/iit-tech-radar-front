import axios from 'axios';
import type { TechRadarEntity, RadarStatistics, FilterState, SortState, User, UserRole } from '../types';

// Use relative path - nginx will proxy /api to backend
const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const techRadarApi = {
  getAll: async (): Promise<TechRadarEntity[]> => {
    const response = await api.get('/tech-radar');
    return response.data;
  },

  getFiltered: async (
    filters: FilterState,
    sort?: SortState
  ): Promise<TechRadarEntity[]> => {
    const params = new URLSearchParams();

    if (filters.category) params.append('category', filters.category);
    if (filters.type) params.append('type', filters.type);
    if (filters.subtype) params.append('subtype', filters.subtype);
    if (filters.maturity) params.append('maturity', filters.maturity);
    if (filters.search) params.append('search', filters.search);
    if (sort?.sortBy) params.append('sortBy', sort.sortBy);
    if (sort?.sortOrder) params.append('sortOrder', sort.sortOrder);

    const response = await api.get(`/tech-radar/filtered?${params.toString()}`);
    return response.data;
  },

  getById: async (id: string): Promise<TechRadarEntity> => {
    const response = await api.get(`/tech-radar/${id}`);
    return response.data;
  },

  search: async (query: string): Promise<TechRadarEntity[]> => {
    const response = await api.get(`/tech-radar/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  getStatistics: async (): Promise<RadarStatistics> => {
    const response = await api.get('/tech-radar/statistics');
    return response.data;
  },

  getByCategory: async (category: string): Promise<TechRadarEntity[]> => {
    const response = await api.get(`/tech-radar/category/${category}`);
    return response.data;
  },

  getByType: async (type: string): Promise<TechRadarEntity[]> => {
    const response = await api.get(`/tech-radar/type/${type}`);
    return response.data;
  },

  create: async (entity: TechRadarEntity): Promise<TechRadarEntity> => {
    const response = await api.post('/tech-radar', entity);
    return response.data;
  },

  update: async (id: string, entity: Partial<TechRadarEntity>): Promise<TechRadarEntity> => {
    const response = await api.put(`/tech-radar/${id}`, entity);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/tech-radar/${id}`);
  },
};

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  getMe: async (): Promise<{ user: User }> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/auth/users');
    return response.data;
  },

  createUser: async (userData: { email: string; password: string; firstName: string; lastName: string; role: UserRole }) => {
    const response = await api.post('/auth/users', userData);
    return response.data;
  },

  updateUser: async (id: string, userData: Partial<User>) => {
    const response = await api.put(`/auth/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id: string) => {
    await api.delete(`/auth/users/${id}`);
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.post('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  },

  setUserPassword: async (id: string, newPassword: string) => {
    const response = await api.post(`/auth/users/${id}/password`, { newPassword });
    return response.data;
  },

  toggleUserStatus: async (id: string) => {
    const response = await api.post(`/auth/users/${id}/toggle-status`);
    return response.data;
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  },
};

export const importApi = {
  importTechRadar: async (data: TechRadarEntity[], options?: { skipExisting?: boolean; updateExisting?: boolean }) => {
    const params = new URLSearchParams();
    if (options?.skipExisting) params.append('skipExisting', 'true');
    if (options?.updateExisting) params.append('updateExisting', 'true');
    const response = await api.post(`/import/tech-radar?${params.toString()}`, data);
    return response.data;
  },

  exportTechRadar: async (): Promise<TechRadarEntity[]> => {
    const response = await api.get('/import/tech-radar');
    return response.data;
  },

  validateTechRadar: async (data: TechRadarEntity[]) => {
    const response = await api.post('/import/tech-radar/validate', data);
    return response.data;
  },
};

export const versionApi = {
  getVersion: async (): Promise<{ version: string; name: string }> => {
    const response = await api.get('/version');
    return response.data;
  },
};
