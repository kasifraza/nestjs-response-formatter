export class PaginationDto {
  page: number;
  limit: number;

  constructor(query: { page?: string | number; limit?: string | number }) {
    this.page = Math.max(1, Number(query.page) || 1);
    this.limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
  }

  get skip(): number {
    return (this.page - 1) * this.limit;
  }
}
