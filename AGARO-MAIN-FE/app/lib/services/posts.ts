import type { Post } from "~/interfaces/post";
import { api } from "../api";

const getPosts = async (q?: string) => {
  return api
    .get<Post[]>("/posts", {
      params: {
        q,
      },
    })
    .then((res) => res)
    .catch((err) => {
      return Promise.reject(err);
    });
};

const getPostById = async (id: string) => {
  return api
    .get<Post>(`/posts/${id}`)
    .then((res) => res)
    .catch((err) => {
      return Promise.reject(err);
    });
};

export const postsService = {
  getPosts,
  getPostById,
};
