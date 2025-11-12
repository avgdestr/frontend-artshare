import axios from "axios";

// Normalize configured API URL to avoid duplicate '/api' segments.
const rawUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
// Remove any trailing slash
let normalized = rawUrl.replace(/\/+$/, "");
// If user provided a URL ending with '/api', strip that so helpers that use '/api/...' don't double it.
if (normalized.toLowerCase().endsWith("/api")) {
  normalized = normalized.slice(0, -4);
}

const api = axios.create({
  baseURL: normalized,
});

// Export the normalized base URL for consumers that need to build absolute URLs
export const API_BASE_URL = normalized;

// Attach auth token from localStorage (if present) to each request
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        // If the token already includes a scheme (e.g. 'Bearer ...'), use it as-is.
        if (token.startsWith("Bearer ") || token.startsWith("Token ")) {
          config.headers.Authorization = token;
        } else {
          // Default to Token scheme (Django REST framework) but many backends use Bearer.
          config.headers.Authorization = `Token ${token}`;
        }
      }
    } catch (e) {
      // ignore if localStorage not available
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: handle 401 globally (remove token and redirect to sign-in)
api.interceptors.response.use(
  (res) => res,
  (error) => {
    // If no response but a request was made, this is likely a network/CORS/connection error.
    const isNetworkError = !error?.response && !!error?.request;
    if (isNetworkError) {
      // Make the error message more helpful for the UI and logs.
      const base = normalized || "(api base URL not configured)";
      error.message = `Network error: could not reach ${base}. Check that the API is running, the URL is correct, and CORS allows requests from this origin. Original error: ${error.message}`;
      // helpful console message during development
      if (typeof console !== "undefined") {
        console.error("API network error:", error);
      }
    }

    if (error?.response?.status === 401) {
      try {
        localStorage.removeItem("token");
      } catch (e) { }
      // redirect to signin page
      if (typeof window !== "undefined") {
        window.location.href = "/signin";
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// Helper to resolve relative media paths returned by the API into absolute URLs
export function resolveMediaUrl(url?: string | null) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${normalized}/${String(url).replace(/^\//, "")}`;
}