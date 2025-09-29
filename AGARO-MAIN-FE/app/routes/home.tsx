import { BookIcon } from "lucide-react";
import { Link } from "react-router";
import type { Route } from "./+types/home";
import logoDark from "./logo-dark.svg";
import logoLight from "./logo-light.svg";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
        <header className="flex flex-col items-center gap-9">
          <div className="w-[500px] max-w-[100vw] p-4">
            <img
              src={logoLight}
              alt="React Router"
              className="block w-full dark:hidden"
            />
            <img
              src={logoDark}
              alt="React Router"
              className="hidden w-full dark:block"
            />
          </div>
        </header>
        <div className="max-w-[500px] w-full space-y-6 px-4">
          {entrypoints.map((entrypoint) => (
            <div key={entrypoint.path}>
              <Link to={entrypoint.path} prefetch="intent">
                {entrypoint.icon}
                {entrypoint.title}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

const entrypoints = [
  {
    title: "Posts",
    path: "/posts",
    icon: <BookIcon />,
  },
];
