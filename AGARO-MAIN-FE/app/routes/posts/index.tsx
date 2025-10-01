import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon } from "lucide-react";
import { Form, Link, useSubmit } from "react-router";
import { useDebounce } from "rooks";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { Spinner } from "~/components/ui/spinner";
import { queryClient } from "~/lib/query-client";
import { postsQueryOptions } from "~/lib/query-client/query-options/posts";
import type { Route } from "./+types/index";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New Posts!" },
    { name: "description", content: "Welcome to Posts!" },
  ];
}

export async function loader(args: Route.LoaderArgs) {
  try {
    const url = new URL(args.request.url);
    const q = url.searchParams.get("q") ?? undefined;
    await queryClient.ensureQueryData(postsQueryOptions(q));
    return {
      q,
    };
  } catch (error) {
    return {
      q: undefined,
    };
  }
}

export default function PostsPage({ loaderData }: Route.ComponentProps) {
  const { q } = loaderData;

  // Example React Query usage - fetching data from JSONPlaceholder API
  const { isLoading, error, data: posts } = useQuery(postsQueryOptions(q));

  const submit = useSubmit();
  const debouncedSubmit = useDebounce(submit, 500);

  return (
    <div className="flex-1 flex flex-col max-w-[500px] gap-16 min-h-0">
      <header className="flex">
        {/* React Query Example */}
        <div className="max-w-full w-full">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Search Posts
          </h2>
          <Form id="search-form" role="form" className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Search posts"
                onChange={(event) => {
                  debouncedSubmit(event.currentTarget.form);
                }}
                className="pr-8 w-full"
              />
              {isLoading && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <Spinner size="sm" variant="muted" />
                </div>
              )}
            </div>
          </Form>
        </div>
      </header>
      <div className="flex flex-col ">
        {isLoading && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Spinner size="sm" />
              <span>Loading posts...</span>
            </div>
            {/* Skeleton loading placeholders */}
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {error && (
          <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
            <CardContent className="pt-6">
              <p className="text-red-600 dark:text-red-400">
                Error:{" "}
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
            </CardContent>
          </Card>
        )}

        {posts && !isLoading && (
          <div className="flex flex-col gap-4">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={{
                  pathname: `/posts/${post.id}`,
                }}
                prefetch="intent"
              >
                <Card className="hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-base">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {post.body}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {!isLoading && !error && posts && posts.length === 0 && (
          <Card className="bg-muted/50">
            <CardContent className="flex items-center justify-between pt-6">
              <p className="text-muted-foreground text-sm">
                No posts found for query: {q}
              </p>
              <Button variant="ghost" asChild>
                <Link
                  to="/posts"
                  className="flex items-center gap-2 text-muted-foreground"
                >
                  <ArrowLeftIcon className="size-4" />
                  Back
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
