import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proteksi /account: Hanya untuk buyer/pelanggan
  if (pathname === "/account" || pathname.startsWith("/account/")) {
    const roleCookie = request.cookies.get("rerasa_user_role")?.value;

    if (roleCookie === "seller") {
      const url = request.nextUrl.clone();
      url.pathname = "/seller/profile";
      return NextResponse.redirect(url);
    }

    if (roleCookie === "admin" || roleCookie === "super_admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/profile";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/account"],
};
