import { PaginationDto } from '../dto/pagination.dto';
import { PaginationResult } from '../interfaces/response.interface';

export class PaginationUtil {
  static paginate<T>(
    items: T[],
    total: number,
    paginationDto: PaginationDto,
  ): PaginationResult<T> {
    const { page = 1, limit = 10 } = paginationDto;
    const totalPages = Math.ceil(total / limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  static getSkip(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  static buildSort(sortBy?: string, sortOrder: 'asc' | 'desc' = 'desc'): any {
    if (!sortBy) return { createdAt: -1 };
    return { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
  }
}
