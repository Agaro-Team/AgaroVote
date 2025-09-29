import { queryOptions } from "@tanstack/react-query";
import type { Post } from "~/interfaces/post";
import { queryKeys } from "~/lib/query-client";

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
    queryKey: queryKeys.postsByQuery(q ?? "all"),
    queryFn: () => getPosts(q),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

const getPostById = async (id: string) => {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/posts/${id}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch post");
  }
  return response.json() as Promise<Post>;
};

const postByIdQueryOptions = (id: string) =>
  queryOptions({
    queryKey: queryKeys.postById(id),
    queryFn: () => getPostById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

export { postsQueryOptions, postByIdQueryOptions };
