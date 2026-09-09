import axios from "axios";

// ─────────────────────────────────────────────────────────────────────────────
// WHAT THIS FILE DOES:
//   Creates one shared axios instance used by every API call in your app.
//
//   When the backend returns a 401 (access token expired), it automatically:
//     1. Calls POST /api/auth/refresh  → backend verifies refreshToken cookie,
//        issues new tokens, and sets them as cookies in the response.
//     2. Retries the original failed request (new accessToken cookie is now set).
//     3. If refresh itself returns 401 → redirects user to /login.
//
//   Your backend refresh endpoint:
//     • Success → HTTP 201, sets new accessToken + refreshToken cookies
//     • Failure → HTTP 401, { success: false, message: "..." }
//
// HOW TO USE IN ANY FILE:
//   import axiosInstance from "@/lib/axiosInstance";   // adjust path if needed
//   const { data } = await axiosInstance.get("/api/something");
// ─────────────────────────────────────────────────────────────────────────────


// ── 1. CREATE THE AXIOS INSTANCE ─────────────────────────────────────────────
//
// withCredentials: true
//   → Tells the browser to send and receive cookies on every request.
//     Without this, your accessToken / refreshToken cookies would never
//     be attached to requests or saved from responses.
//
// No baseURL needed
//   → Next.js rewrites in next.config.mjs already forward /api/* to your
//     backend. Adding a baseURL here would bypass that proxy and break things.
//
const axiosInstance = axios.create({
  withCredentials: true,
});


// ── 2. QUEUE — handles multiple simultaneous 401s ────────────────────────────
//
// Scenario: Three requests fire at the same time. All three get 401.
//
// WITHOUT a queue: all three would call /refresh simultaneously → race condition
//   → the backend rotates the refreshToken on first call, the other two arrive
//     with a now-invalid refreshToken and all fail.
//
// WITH a queue:
//   • The FIRST 401 sets isRefreshing = true and starts the refresh call.
//   • The OTHER two see isRefreshing = true, park themselves in failedQueue,
//     and wait (they return a Promise that won't resolve until refresh finishes).
//   • Once refresh succeeds, processQueue(null) resolves all waiting Promises
//     and each queued request retries automatically.
//   • If refresh fails, processQueue(error) rejects them all.
//
let isRefreshing = false;   // lock: true while a refresh HTTP call is in-flight
let failedQueue  = [];      // [ { resolve, reject }, ... ] — parked requests


// processQueue — called once after refresh succeeds or fails.
//   error = null  → success path: resolve all parked promises so they retry
//   error = Error → failure path: reject all parked promises so they throw
//
const processQueue = (error) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
};


// ── 3. RESPONSE INTERCEPTOR ──────────────────────────────────────────────────

axiosInstance.interceptors.response.use(

  // ── 3a. SUCCESS (2xx) — pass through untouched ────────────────────────────
  (response) => response,


  // ── 3b. ERROR — only act on 401, bubble everything else ───────────────────
  async (error) => {

    // The config of the request that caused this error.
    // We'll re-fire it after getting a fresh token.
    const originalRequest = error.config;

    // ── Is this a 401? ───────────────────────────────────────────────────────
    //
    // Your backend sends BOTH an HTTP 401 status AND statusCode:401 in the
    // JSON body, so checking error.response.status is enough.
    // We also check the body's statusCode as a safety net (e.g. if a proxy
    // swallows the HTTP status and only passes the JSON through).
    //
    const is401 =
      error.response?.status === 401 ||
      error.response?.data?.statusCode === 401;

    // _retry flag — prevents an infinite loop.
    // If we retry the original request and IT also gets a 401 (shouldn't
    // happen normally, but could if the new token is somehow bad), we must
    // NOT call refresh again. The flag ensures we only retry once.
    if (is401 && !originalRequest._retry) {

      // ── CASE A: refresh already in progress ─────────────────────────────
      // Park this request; it will retry after the in-flight refresh finishes.
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosInstance(originalRequest))  // retry on success
          .catch((err) => Promise.reject(err));        // throw on failure
      }

      // ── CASE B: no refresh in progress — start one ──────────────────────
      originalRequest._retry = true;  // mark before going async
      isRefreshing = true;

      try {
        // POST /api/auth/refresh
        //   • The browser sends the refreshToken cookie automatically
        //     (withCredentials: true is inherited from the instance).
        //   • Your backend responds with HTTP 201 and sets two new cookies:
        //       refreshToken  (new, rotated)
        //       accessToken   (new, 15-min expiry)
        //   • We don't need to read the response body — the cookies are
        //     set by the browser automatically from the Set-Cookie header.
        //
        await axiosInstance.post("/api/auth/refresh");

        // Refresh succeeded → wake up all parked requests so they retry
        processQueue(null);

        // Retry the original request that first triggered the 401.
        // The browser now has a fresh accessToken cookie, so this should work.
        return axiosInstance(originalRequest);

      } catch (refreshError) {
        // ── REFRESH FAILED (refresh token expired / missing / invalid) ──────
        //
        // Your backend returns HTTP 401 here, e.g.:
        //   { success: false, message: "Refresh token missing" }
        //   { success: false, message: "Invalid refresh token" }
        //   { success: false, message: "Refresh failed", error: "..." }
        //
        // Wake up all parked requests and tell them to fail too
        processQueue(refreshError);

        // ── Optional: dispatch a Redux logout action ──────────────────────
        // If you track auth state in Redux, clean it up here so your UI
        // reflects the logged-out state immediately.
        //
        // Uncomment and adjust the import path once you have an auth slice:
        //
        //   import { store } from "@/store";
        //   import { clearAuth } from "@/features/auth/authSlice";
        //   store.dispatch(clearAuth());
        //

        // Hard redirect to login — works from anywhere including interceptors
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);

      } finally {
        // Reset the lock whether refresh succeeded or failed,
        // so the next expiry cycle works correctly.
        isRefreshing = false;
      }
    }

    // Not a 401 (e.g. 400, 403, 404, 500) OR already retried → bubble up
    return Promise.reject(error);
  }
);


export default axiosInstance;


// ─────────────────────────────────────────────────────────────────────────────
// MIGRATION EXAMPLES
// ─────────────────────────────────────────────────────────────────────────────
//
// ── Redux slice (GET) ────────────────────────────────────────────────────────
//
// BEFORE:
//   const res = await fetch(`/api/roles/view/allpermissions`, {
//     method: 'GET',
//     credentials: "include",
//     headers: { 'Content-Type': 'application/json' },
//   });
//   const data = await res.json();
//   if (!res.ok) {
//     toast.error(data.message || 'Failed');
//     return thunkAPI.rejectWithValue(data.message);
//   }
//   return data?.data;
//
// AFTER:
//   import axiosInstance from "@/lib/axiosInstance";
//
//   const { data } = await axiosInstance.get(`/api/roles/view/allpermissions`);
//   return data?.data;
//   // axiosInstance throws on non-2xx automatically, so no if(!res.ok) needed.
//   // The catch(err) in your thunk catches it and calls rejectWithValue.
//
//
// ── Redux slice (POST with body) ─────────────────────────────────────────────
//
// BEFORE:
//   const res = await fetch(`/api/roles/${roleId}/permissions`, {
//     method: 'POST',
//     credentials: "include",
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ permissions }),
//   });
//   const data = await res.json();
//
// AFTER:
//   const { data } = await axiosInstance.post(
//     `/api/roles/${roleId}/permissions`,
//     { permissions }    // axios serialises to JSON automatically
//   );
//   return data?.data;
//
//
// ── Login page (already uses axios) ──────────────────────────────────────────
//
// BEFORE:
//   const { data } = await axios.post("/api/auth/login", { email, password }, {
//     withCredentials: true,   // ← remove this line
//   });
//
// AFTER:
//   const { data } = await axiosInstance.post("/api/auth/login", { email, password });
//   // withCredentials is already set on the instance — no need to repeat it.
//
// ─────────────────────────────────────────────────────────────────────────────