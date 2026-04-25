import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("role")?.value;

  const { pathname } = request.nextUrl;

  // ako nije ulogovan
  if (
    (pathname.startsWith("/dashboard") ||
      pathname.startsWith("/appointments")) &&
    !token
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // dashboard samo salon/admin
  if (pathname.startsWith("/dashboard")) {
    if (role !== "Salon" && role !== "Admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // appointments samo user
  if (pathname.startsWith("/appointments")) {
    if (role !== "User") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/appointments/:path*"],
};