import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

const postsRoutes = prefix("posts", [
  layout("routes/posts/layout.tsx", [
    index("routes/posts/index.tsx"),
    route(":id", "routes/posts/show.tsx"),
  ]),
]);

const authRoutes = prefix("auth", [
  layout("routes/auth/layout.tsx", [
    route("login", "routes/auth/login.tsx"),
    route("register", "routes/auth/register.tsx"),
  ]),
]);

export default [
  index("routes/home.tsx"),

  ...postsRoutes,
  ...authRoutes,
] satisfies RouteConfig;
