import { queryClient } from "~/lib/query-client";
import type { Route } from "./+types/show";
import { postByIdQueryOptions } from "~/lib/query-client/query-options/posts";
import { Link, useLoaderData } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "~/components/ui/spinner";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ArrowLeftIcon } from "lucide-react";

export async function loader({ params }: Route.LoaderArgs) {
  await queryClient.ensureQueryData(postByIdQueryOptions(params.id));
  return {
    id: params.id,
  };
}

const ShowPostPage = ({ loaderData }: Route.ComponentProps) => {
  const { id } = loaderData;

  const {
    data: post,
    isLoading,
    error,
    refetch,
  } = useQuery(postByIdQueryOptions(id));

  return (
    <div className="max-w-[500px] w-full space-y-6">
      <header className="flex justify-between gap-9">
        <h1 className="text-2xl font-semibold">Post {id}</h1>
        <Button variant="outline" asChild>
          <Link to="/posts" className="flex items-center gap-2">
            <ArrowLeftIcon className="size-4" />
            Back
          </Link>
        </Button>
      </header>

      {isLoading && (
        <Card>
          <CardContent className="flex items-center gap-2 pt-6">
            <Spinner size="sm" />
            <span>Loading post...</span>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
          <CardContent className="flex items-center justify-between pt-6">
            <span className="text-red-600 dark:text-red-400">
              Error loading post
            </span>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {post && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{post.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{post.body}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ShowPostPage;
