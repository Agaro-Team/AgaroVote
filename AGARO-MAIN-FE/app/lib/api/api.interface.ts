export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export interface ApiRequest {
  page?: number;

  limit?: number;

  sortBy?: string;

  order?: SortOrder;

  q?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiListResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ApiDetailResponse<T> {
  data: T;
}
