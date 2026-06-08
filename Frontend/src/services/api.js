import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ft_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// AUTH
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  sendOtp: (username) => api.post('/auth/send-otp', null, { params: { username } }),
  verifyOtp: (username, Otp) => api.post('/auth/verify-otp', null, { params: { username, Otp } }),
  sendResetOtp: (username) => api.post('/auth/send-reset-otp', null, { params: { username } }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
}

// FAMILY
export const familyAPI = {
  create: (data) => api.post('/family/create', data),
  join: (data) => api.post('/family/join', data),
  viewAll: () => api.get('/family/viewAllFamilies'),
  details: (familyId) => api.get('/family/FamilyDetails', { params: { familyId } }),
  leave: (familyId) => api.delete('/family/leave', { params: { familyId } }),
}

// LOCATION
export const locationAPI = {
  getMe: () => api.get('/location/me'),
  update: (data) => api.post('/location/update', data),
  getAll: (familyId) => api.get(`/location/${familyId}`),
  getMember: (familyId, userId) => api.get(`/location/${familyId}/${userId}`),
}

// MESSAGE
export const messageAPI = {
  send: (familyId, userId, data) => api.post(`/message/${familyId}/${userId}`, data),
}

export default api
