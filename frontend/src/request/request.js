import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import dayjs from 'dayjs';
import { setTokenExpired, logOut } from '@modules/Auth/authSlice';
import { store } from 'src/store';
import { message } from 'antd';


const baseURLs = {
  production: (import.meta.env?.VITE_BACKEND_URL || '') + '/api/',
};

const environment = 'production';
console.log(environment, 'environment');

const request = axios.create({
  baseURL: baseURLs[environment],
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Session policy: 8-hour session from login.
// The backend issues JWTs with an 8-hour `exp`; when it lapses we log the
// user out. Users stay logged in for a full working day without interruption.
const forceLogout = () => {
  try {
    localStorage.removeItem('persist');
    localStorage.removeItem('user');
  } catch (_) { /* storage unavailable */ }
  store.dispatch(logOut());
  store.dispatch(setTokenExpired(true));
  // Only redirect if we're not already on the sign-in / public statement pages
  if (typeof window !== 'undefined') {
    const path = window.location.pathname || '';
    if (!path.startsWith('/signin') && !path.startsWith('/statement/')) {
      message.error('Your session has expired. Please log in again.');
      window.location.assign('/signin');
    }
  }
};

request.interceptors.request.use((config) => {
  const persist = localStorage.getItem('persist');
  const authToken = persist ? JSON.parse(persist) : null;
  if (!authToken?.jwt) return config;

  try {
    const jwt = jwtDecode(authToken.jwt);
    if (!jwt?.exp || dayjs.unix(jwt.exp).isBefore(dayjs())) {
      forceLogout();
      // Prevent the request from firing – it would just get a 401 anyway.
      return Promise.reject(new axios.Cancel('Session expired'));
    }
  } catch (_) {
    forceLogout();
    return Promise.reject(new axios.Cancel('Invalid session'));
  }

  config.headers.Authorization = authToken.jwt;
  return config;
});

request.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 (Unauthorized) or 403 with "Unauthenticated" body => session died.
    const status = error?.response?.status;
    const detail = error?.response?.data?.detail || error?.response?.data?.message;
    if (
      status === 401 ||
      (status === 403 && typeof detail === 'string' && /unauthenticat/i.test(detail))
    ) {
      forceLogout();
    }
    if (axios.isAxiosError(error) && !error.response) {
      // Network error – nothing to do here.
    }
    return Promise.reject(error);
  }
);

export default request;

export const baseRequest = axios.create({
  baseURL: baseURLs[environment],
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
});

export const IMG_BASE_URL = baseURLs[environment];
