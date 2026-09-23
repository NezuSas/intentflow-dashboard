export interface PageMeta {
  count: number;
  page: number;
  pageSize: number;
  next: string | null;
  previous: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PageMeta;
}

export interface ListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  ordering?: string;
}
