import { NextResponse } from "next/server";

// Helper — calls /api/auth/authme with whichever token string you pass
async function checkAuth(request, cookieHeader) {
    // console.log("CHECK ATUH RUN")
  const url = new URL("/api/auth/authme", request.url);
  const response = await fetch(url, {
    headers: { Cookie: cookieHeader },
  });

  const data = await response.json();
  return data?.ok;
}

// Helper — calls /api/auth/refresh with the refreshToken cookie
// Returns the new Set-Cookie headers if successful, null if failed
async function tryRefresh(request, refreshToken) {
  const url = new URL("/api/auth/refresh", request.url);
  const response = await fetch(url, {
    method: "POST",
    headers: { Cookie: `${refreshToken.name}=${refreshToken.value}` },
  });

  if (!response.ok && !success) return null;

  // The backend's Set-Cookie headers contain the new accessToken + refreshToken
  // We need to forward these onto the NextResponse so the browser gets them
  return response.headers.get("set-cookie");
}


export async function proxy(request) {

  const accessToken  = request.cookies.get("accessToken");
  const refreshToken = request.cookies.get("refreshToken");
  const pathname     = request.nextUrl.pathname;


  // ── PROTECT DASHBOARD + FORBIDDEN ROUTES ───────────────────────────────────
  if (
    pathname.startsWith("/feed") ||
    pathname.startsWith("/explore") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/notifications") ||
    pathname.startsWith("/chats") ||
    pathname.startsWith("/search") ||
    pathname.startsWith("/post")
  ) {

    // No tokens at all → straight to login
    if (!accessToken && !refreshToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      // 1. Try accessToken first
      if (accessToken) {
        const cookieHeader = `${accessToken.name}=${accessToken.value}`;
        const isValid = await checkAuth(request, cookieHeader);
// console.log(isValid, "ISVALIUD")
        if (isValid) return NextResponse.next(); // all good, let them through
      }

      // 2. accessToken missing or expired — try refreshing
      if (refreshToken) {
        const newCookies = await tryRefresh(request, refreshToken);

        if (newCookies) {
          // Refresh worked — forward the new cookies to the browser and
          // let the request through. The browser will store the new tokens.
          const response = NextResponse.next();
          response.headers.set("set-cookie", newCookies);
          return response;
        }
      }

      // 3. Both failed → send to login
      return NextResponse.redirect(new URL("/login", request.url));

    } catch (error) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }


  // ── PREVENT LOGGED-IN USERS FROM ACCESSING /login OR /register ─────────────
  if (pathname === "/register" || pathname === "/login") {
    // console.log(accessToken, "ACCESSTOKEN")
    if (accessToken) {
      try {
        const cookieHeader = `${accessToken.name}=${accessToken.value}`;
        const isValid = await checkAuth(request, cookieHeader);
        // console.log(isValid, "VALIDDD")

        if (isValid) {
          return NextResponse.redirect(new URL("/explore", request.url));
        }

        // accessToken invalid — try refresh before letting them onto login page
        if (refreshToken) {
          const newCookies = await tryRefresh(request, refreshToken);

          if (newCookies) {
            // Still has a valid session → send to dashboard with fresh cookies
            const response = NextResponse.redirect(new URL("/explore", request.url));
            response.headers.set("set-cookie", newCookies);
            return response;
          }
        }

        // Both expired → let them onto login page normally
        return NextResponse.next();

      } catch (error) {
        return NextResponse.next();
      }
    }
  }


  return NextResponse.next();
}


export const config = {
  matcher: [
    "/feed/:path*",
    "/explore/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/notifications/:path*",
    "/chats/:path*",
    "/search/:path*",
    "/register",
    "/login",
    "/post/:path*",
  ],
};