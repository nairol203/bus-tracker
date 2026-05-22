import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/trip/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url, 301);
  }

  if (pathname.startsWith("/stop/")) {
    const stopId = pathname.split("/")[2];

    const url = request.nextUrl.clone();
    url.pathname = "/";

    url.search = "";
    url.searchParams.set("stop", stopId);

    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/stop/:path*", "/trip/:path*"],
};
