import api from './api';

export const userService = {
  getMyProfile: () => api.get('/users/profile').then((res) => res.data),
  getUserByUsername: (username) => api.get(`/users/${username}`).then((res) => res.data),
  updateProfile: (data) => api.put('/users/profile', data).then((res) => res.data),
  updateProfilePicture: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api
      .put('/users/profile/picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data);
  },
  followUser: (id) => api.post(`/users/follow/${id}`).then((res) => res.data),
  unfollowUser: (id) => api.post(`/users/unfollow/${id}`).then((res) => res.data),
  searchUsers: (q) => api.get('/users/search', { params: { q } }).then((res) => res.data),
  getSuggestedUsers: () => api.get('/users/suggestions').then((res) => res.data),
};
