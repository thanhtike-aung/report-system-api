export type Pagination = {
  page: number;
  limit: number;
  total?: number;
};

export type SortOrder = 'asc' | 'desc';

export type QueryOptions = {
  pagination?: Pagination;
  sort?: {
    field: string;
    order: SortOrder;
  };
  filter?: Record<string, unknown>;
};

export type WithTimestamps = {
  created_at: Date;
  updated_at: Date;
};