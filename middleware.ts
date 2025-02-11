import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

const protectedRoutes = [
  "/dashboard",
  "/dashboard/chessboard",
  "/dashboard/reviewgame",
  "/dashboard/hallofgames",
  "/dashboard/opponent",
];

export default auth(async (req: NextRequest) => {
  const session = await auth();
  if (!session && protectedRoutes.includes(req.nextUrl.pathname)) {
    const absoluteURL = new URL("/", req.nextUrl.origin);
    return NextResponse.redirect(absoluteURL.toString());
  }
});
