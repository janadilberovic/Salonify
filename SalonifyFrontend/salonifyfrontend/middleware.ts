import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("role")?.value;

  const { pathname } = request.nextUrl;

  // ako nije ulogovan
  if (
    (pathname.startsWith("/dashboard") ||
      pathname.startsWith("/appointments") ||
      pathname.startsWith("/dashboard/reviews") ||
      pathname.startsWith("/admin")) &&
    !token
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // dashboard je samo za salon; admin ima poseban /admin panel
  if (pathname.startsWith("/dashboard")) {
    if (role === "Admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    if (role !== "Salon") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // appointments samo user
  if (pathname.startsWith("/appointments")) {
    if (role !== "User") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // dashboard/reviews samo salon/admin
  if (pathname.startsWith("/dashboard/reviews")) {
    if (role !== "Salon" && role !== "Admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // admin panel samo admin
  if (pathname.startsWith("/admin")) {
    if (role !== "Admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/appointments/:path*", "/admin", "/admin/:path*"],
};
