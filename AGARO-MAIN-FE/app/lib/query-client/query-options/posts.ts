import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "~/lib/query-client";
import { postsService } from "~/lib/services/posts";

const postsQueryOptions = (q?: string) =>
  queryOptions({
    queryKey: queryKeys.postsByQuery(q ?? "all"),
    queryFn: () => postsService.getPosts(q),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

const postByIdQueryOptions = (id: string) =>
  queryOptions({
    queryKey: queryKeys.postById(id),
    queryFn: () => postsService.getPostById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

export { postByIdQueryOptions, postsQueryOptions };
