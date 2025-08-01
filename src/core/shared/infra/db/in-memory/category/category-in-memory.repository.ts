import { Category } from '../../../../../category/domain/category.aggregate';
import { CategoryId } from '../../../../../category/domain/value-objects/category-id.vo';
import { SortDirection } from '../../../../domain/repository/search-params';
import { InMemorySearchableRepository } from '../in-memory.repository';

export class CategoryInMemoryRepository extends InMemorySearchableRepository<
  Category,
  CategoryId
> {
  sortableFields: string[] = ['name', 'created_at'];
  protected async applyFilter(
    items: Category[],
    filter: string,
  ): Promise<Category[]> {
    if (!filter) return items;
    const filteredItems = items.filter((item) =>
      item.name.toLowerCase().includes(filter.toLowerCase()),
    );
    return filteredItems;
  }
  protected applySort(
    items: Category[],
    sort: string | null,
    sort_dir: SortDirection | null,
  ): Category[] {
    return sort
      ? super.applySort(items, sort, sort_dir)
      : super.applySort(items, 'created_at', 'desc');
  }
  getEntity(): new (...args: any[]) => Category {
    return Category;
  }
}
