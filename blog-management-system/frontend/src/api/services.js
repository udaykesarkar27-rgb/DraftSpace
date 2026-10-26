import api from './client.js';

export const authApi = {
  login: (identifier, password) => api.post('/auth/login', { identifier, password }).then((r) => r.data),
  register: (username, email, password) =>
    api.post('/auth/register', { username, email, password }).then((r) => r.data),
};

export const postApi = {
  list: ({ page = 0, size = 9, category = '', search = '' } = {}) =>
    api.get('/posts', { params: { page, size, category, search } }).then((r) => r.data),
  mine: ({ page = 0, size = 10 } = {}) => api.get('/posts/mine', { params: { page, size } }).then((r) => r.data),
  get: (id) => api.get(`/posts/${id}`).then((r) => r.data),
  categories: () => api.get('/posts/categories').then((r) => r.data),
  create: (data) => api.post('/posts', data).then((r) => r.data),
  update: (id, data) => api.put(`/posts/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/posts/${id}`),

  // Added toggleLike for Module 2
  toggleLike: (id) => api.post(`/posts/${id}/like`).then((r) => r.data),
};

export const commentApi = {
  list: (postId) => api.get(`/posts/${postId}/comments`).then((r) => r.data),
  add: (postId, content) => api.post(`/posts/${postId}/comments`, { content }).then((r) => r.data),
  remove: (id) => api.delete(`/comments/${id}`),
};

export const adminApi = {
  metrics: () => api.get('/admin/metrics').then((r) => r.data),
  users: ({ page = 0, size = 10 } = {}) => api.get('/admin/users', { params: { page, size } }).then((r) => r.data),
  setRoles: (id, roles) => api.put(`/admin/users/${id}/roles`, { roles }).then((r) => r.data),
  setEnabled: (id, enabled) => api.patch(`/admin/users/${id}/enabled`, { enabled }).then((r) => r.data),
  comments: ({ page = 0, size = 10 } = {}) =>
    api.get('/admin/comments', { params: { page, size } }).then((r) => r.data),
};