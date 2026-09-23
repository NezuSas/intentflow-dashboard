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

export interface ApiPageMeta {
  count: number;
  page: number;
  page_size: number;
  next: string | null;
  previous: string | null;
}

export interface ApiPaginatedEnvelope<T> {
  data?: T[];
  meta: ApiPageMeta;
}

export const buildListPath = (
  path: string,
  query: ListQuery = {}
) => {
  const params = new URLSearchParams();

  if (query.page !== undefined) params.set("page", String(query.page));
  if (query.pageSize !== undefined) params.set("page_size", String(query.pageSize));
  if (query.search) params.set("search", query.search);
  if (query.ordering) params.set("ordering", query.ordering);

  const queryString = params.toString();
  return queryString ? `${path}?${queryString}` : path;
};

export const mapPaginatedResponse = <T>(
  response: ApiPaginatedEnvelope<T>
): PaginatedResponse<T> => ({
  data: response.data ?? [],
  meta: {
    count: response.meta.count,
    page: response.meta.page,
    pageSize: response.meta.page_size,
    next: response.meta.next,
    previous: response.meta.previous,
  },
});
