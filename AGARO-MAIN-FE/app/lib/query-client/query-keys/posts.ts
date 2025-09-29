export const postsQueryKeys = {
  posts: ["posts"] as const,
  postsByQuery: (query: string) =>
    [...postsQueryKeys.posts, { query }] as const,
  postById: (id: string) => [...postsQueryKeys.posts, { id }] as const,
} as const;
