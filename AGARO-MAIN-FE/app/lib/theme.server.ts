import { createCookie } from "react-router";

export const themeCookie = createCookie("theme", {
  maxAge: 31536000, // 1 year
  path: "/",
  sameSite: "lax",
  httpOnly: false,
  secure: process.env.NODE_ENV === "production",
});

export type Theme = "light" | "dark" | "system";

export async function getTheme(request: Request): Promise<Theme> {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = await themeCookie.parse(cookieHeader);
  return cookie?.theme || "system";
}
