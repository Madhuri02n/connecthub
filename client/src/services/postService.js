import api from './api';

export const postService = {
  getFeed: (page = 1, limit = 10) =>
    api.get('/posts', { params: { page, limit } }).then((res) => res.data),
  getPostById: (id) => api.get(`/posts/${id}`).then((res) => res.data),
  createPost: (file, caption) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('caption', caption || '');
    return api
      .post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((res) => res.data);
  },
  updatePost: (id, caption) => api.put(`/posts/${id}`, { caption }).then((res) => res.data),
  deletePost: (id) => api.delete(`/posts/${id}`).then((res) => res.data),
  likePost: (id) => api.post(`/posts/${id}/like`).then((res) => res.data),
  unlikePost: (id) => api.post(`/posts/${id}/unlike`).then((res) => res.data),
  addComment: (id, text) => api.post(`/posts/${id}/comment`, { text }).then((res) => res.data),
  deleteComment: (postId, commentId) =>
    api.delete(`/posts/${postId}/comment/${commentId}`).then((res) => res.data),
  sharePost: (id) => api.post(`/posts/${id}/share`).then((res) => res.data),
  toggleBookmark: (id) => api.post(`/posts/${id}/bookmark`).then((res) => res.data),
  searchPosts: (q) => api.get('/posts/search', { params: { q } }).then((res) => res.data),
  getTrending: () => api.get('/posts/trending').then((res) => res.data),
};
