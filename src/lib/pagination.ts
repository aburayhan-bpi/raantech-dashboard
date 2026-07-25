export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export function getPaginationMeta(total: number, page: number = 1, limit: number = 10): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPage: Math.ceil(total / limit),
  };
}

export function parsePaginationParams(searchParams: URLSearchParams) {
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}
