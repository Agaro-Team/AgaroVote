import { queryOptions, useQuery } from "@tanstack/react-query";
import { Form, useLoaderData, useSubmit } from "react-router";
import { useDebounce } from "rooks";
import { Input } from "~/components/ui/input";
import { queryClient } from "~/lib/query-client";
import type { Route } from "./+types/home";
import logoDark from "./logo-dark.svg";
import logoLight from "./logo-light.svg";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

interface Post {
  id: number;
  title: string;
  body: string;
}

const getPosts = async (q?: string) => {
  const url = new URL("https://jsonplaceholder.typicode.com/posts");
  if (q) {
    url.searchParams.set("q", q);
  }
  if (q === "all" || q === "") {
    url.searchParams.delete("q");
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error("Failed to fetch posts");
  }
  return response.json() as Promise<Post[]>;
};

const postsQueryOptions = (q?: string) =>
  queryOptions({
    queryKey: ["posts", { q: q ?? "all" }],
    queryFn: () => getPosts(q),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

export async function loader(args: Route.LoaderArgs) {
  const url = new URL(args.request.url);
  const q = url.searchParams.get("q") ?? "all";
  await queryClient.ensureQueryData(postsQueryOptions(q));
  return {
    q,
  };
}

export default function Home() {
  const { q } = useLoaderData<typeof loader>();

  // Example React Query usage - fetching data from JSONPlaceholder API
  const { isLoading, error, data: posts } = useQuery(postsQueryOptions(q));

  const submit = useSubmit();
  const debouncedSubmit = useDebounce(submit, 500);

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

          {/* React Query Example */}
          <div className="max-w-[600px] w-full p-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              React Query Example
            </h2>
            <Form id="search-form" role="form" className="flex gap-2">
              <Input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Search posts"
                onChange={(event) => {
                  debouncedSubmit(event.currentTarget.form);
                }}
              />
            </Form>
          </div>
        </header>
        <div className="max-w-[500px] w-full space-y-6 px-4">
          {isLoading && (
            <p className="text-gray-600 dark:text-gray-400">Loading posts...</p>
          )}
          {error && (
            <p className="text-red-600 dark:text-red-400">
              Error: {error instanceof Error ? error.message : "Unknown error"}
            </p>
          )}

          {posts && (
            <div className="space-y-3">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <h3 className="font-medium text-gray-800 dark:text-gray-200">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {post.body}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
