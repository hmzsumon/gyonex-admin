import axios, { AxiosInstance } from 'axios';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const api: AxiosInstance = axios.create({
  baseURL: BASE,
  withCredentials: true,
  timeout: 15000,
});

// Attach JWT token
api.interceptors.request.use(cfg => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('admin_token');
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

// Handle 401
api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login:          (d: object) => api.post('/auth/login', d),
  logout:         ()          => api.post('/auth/logout'),
  changePassword: (d: object) => api.post('/users/change-password', d),
  sendEmailOtp:   (d: object) => api.post('/auth/send-email-change-otp', d),
  changeEmail:    (d: object) => api.post('/auth/change-email', d),
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashApi = {
  getStats: () => api.get('/admin/stats'),
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const usersApi = {
  getAll:    (p?: object) => api.get('/admin/users', { params: p }),
  getById:   (id: string) => api.get(`/admin/users/${id}`),
  update:    (id: string, d: object) => api.patch(`/admin/users/${id}`, d),
  freeze:    (id: string) => api.patch(`/admin/users/${id}/freeze`),
  unfreeze:  (id: string) => api.patch(`/admin/users/${id}/unfreeze`),
  delete:    (id: string) => api.delete(`/admin/users/${id}`),
  adjustBal: (id: string, d: object) => api.post(`/admin/wallets/${id}/adjust`, d),
};

// ─── KYC ──────────────────────────────────────────────────────────────────────
export const kycApi = {
  getAll:   (p?: object) => api.get('/admin/kyc', { params: p }),
  approve:  (id: string) => api.patch(`/admin/kyc/${id}/approve`),
  reject:   (id: string, reason: string) => api.patch(`/admin/kyc/${id}/reject`, { reason }),
};

// ─── Wallets & Transactions ───────────────────────────────────────────────────
export const walletsApi = {
  getAll:        (p?: object) => api.get('/admin/users', { params: p }),
  getWithdrawals:(p?: object) => api.get('/admin/withdrawals', { params: p }),
  approveWith:   (id: string) => api.patch(`/admin/withdrawals/${id}/approve`),
  rejectWith:    (id: string, reason: string) => api.patch(`/admin/withdrawals/${id}/reject`, { reason }),
};

// ─── Loans ────────────────────────────────────────────────────────────────────
export const loansApi = {
  getAll:  (p?: object) => api.get('/loans/admin/all', { params: p }),
  approve: (id: string, d: object) => api.patch(`/loans/admin/${id}/approve`, d),
  reject:  (id: string, reason: string) => api.patch(`/loans/admin/${id}/reject`, { reason }),
};

// ─── Ranks ────────────────────────────────────────────────────────────────────
export const ranksApi = {
  getAll:       (p?: object) => api.get('/ranks/admin/all', { params: p }),
  uploadImage:  (id: string, fd: FormData) => api.post(`/ranks/admin/upload-image/${id}`, fd),
  getLeaderboard: () => api.get('/ranks/leaderboard'),
};

// ─── CMS ──────────────────────────────────────────────────────────────────────
export const cmsApi = {
  getBanners: () => api.get('/cms/banners'),
  createBanner:(d: object) => api.post('/cms/banners', d),
  deleteBanner:(id: string) => api.delete(`/cms/banners/${id}`),
  getBlog:    (p?: object) => api.get('/cms/blog', { params: p }),
  createBlog: (d: object) => api.post('/cms/blog', d),
};

// ─── System ───────────────────────────────────────────────────────────────────
export const systemApi = {
  getSettings:  () => api.get('/admin/settings'),
  saveSettings: (d: object) => api.patch('/admin/settings', d),
  pauseTrading: () => api.post('/admin/trading/pause'),
  resumeTrading:() => api.post('/admin/trading/resume'),
  getStats:     () => api.get('/admin/stats'),
  broadcast:    (d: object) => api.post('/admin/broadcast', d),
};

// ─── ROI ──────────────────────────────────────────────────────────────────────
export const roiApi = {
  release: (d: object) => api.post('/admin/financial/release-roi', d),
};

// ─── Admin: User Management ─────────────────────────────────────────────────
export const adminApi = {
  getStats:   ()           => api.get('/admin/dashboard'),
  getUsers:   (p?: object) => api.get('/admin/users', { params: p }),
  updateStatus:(id: string, status: string) => api.patch(`/admin/users/${id}/status`, { status }),
  createUser: (d: object)  => api.post('/admin/users/create', d),
};
