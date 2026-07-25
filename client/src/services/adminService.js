import api from './api';

export const adminService = {
  getStats: () => api.get('/admin/stats').then((res) => res.data),
  getAllUsers: (page = 1, limit = 20) =>
    api.get('/admin/users', { params: { page, limit } }).then((res) => res.data),
  toggleUserActive: (id) => api.put(`/admin/users/${id}/toggle-active`).then((res) => res.data),
  deletePost: (id) => api.delete(`/admin/posts/${id}`).then((res) => res.data),
};
