import { Entity } from '@core/shared/domain/entity';
import { InvalidArgumentError } from '@core/shared/domain/errors/invalid-argument.error';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import {
  IRepository,
  ISearchableRepository,
} from '@core/shared/domain/repository/repository-interface';
import {
  SearchParams,
  SortDirection,
} from '@core/shared/domain/repository/search-params';
import { SearchResult } from '@core/shared/domain/repository/search-result';
import { ValueObject } from '@core/shared/domain/value-object';

export abstract class InMemoryRepository<
  E extends Entity,
  EntityId extends ValueObject,
> implements IRepository<E, EntityId>
{
  existsById(
    ids: EntityId[],
  ): Promise<{ exists: EntityId[]; not_exists: EntityId[] }> {
    throw new Error('Method not implemented.');
  }
  items: E[] = [];
  async insert(entity: E): Promise<void> {
    this.items.push(entity);
  }
  async bulkInsert(entity: E[]): Promise<void> {
    this.items.push(...entity);
  }
  async update(entity: E): Promise<void> {
    const indexFound = this.items.findIndex((item) =>
      item.entity_id.equals(entity.entity_id),
    );
    if (indexFound === -1) {
      throw new NotFoundError(entity.entity_id.toString(), this.getEntity());
    }
    this.items[indexFound] = entity;
  }
  async delete(entity_id: EntityId): Promise<void> {
    const indexFound = this.items.findIndex((item) =>
      item.entity_id.equals(entity_id),
    );
    if (indexFound === -1) {
      throw new NotFoundError(entity_id, this.getEntity());
    }
    this.items.splice(indexFound, 1);
  }
  async findById(entity_id: EntityId): Promise<E | null> {
    return this._get(entity_id);
  }
  async findAll(): Promise<E[]> {
    return this.items;
  }

  protected async _get(entity_id: EntityId) {
    const item = this.items.find((item) => item.entity_id.equals(entity_id));
    return typeof item === 'undefined' ? null : item;
  }
  abstract getEntity(): new (...args: any[]) => E;
}

export abstract class InMemorySearchableRepository<
    E extends Entity,
    EntityId extends ValueObject,
    Filter = string,
  >
  extends InMemoryRepository<E, EntityId>
  implements ISearchableRepository<E, EntityId, Filter>
{
  sortableFields: string[] = [];
  async search(props: SearchParams<Filter>): Promise<SearchResult<E>> {
    const itemsFiltered = await this.applyFilter(this.items, props.filter);
    const itemsSorted = this.applySort(
      itemsFiltered,
      props.sort,
      props.sort_dir,
    );
    const itemsPaginated = this.applyPaginate(
      itemsSorted,
      props.page,
      props.per_page,
    );
    return new SearchResult({
      items: itemsPaginated,
      total: itemsFiltered.length,
      current_page: props.page,
      per_page: props.per_page,
    });
  }

  async existsById(
    ids: EntityId[],
  ): Promise<{ exists: EntityId[]; not_exists: EntityId[] }> {
    if (!ids.length) {
      throw new InvalidArgumentError(
        'ids must be an array with at least one element',
      );
    }

    if (this.items.length === 0) {
      return {
        exists: [],
        not_exists: ids,
      };
    }

    const existsId = new Set<EntityId>();
    const notExistsId = new Set<EntityId>();
    ids.forEach((id) => {
      const item = this.items.find((entity) => entity.entity_id.equals(id));
      item ? existsId.add(id) : notExistsId.add(id);
    });
    return {
      exists: Array.from(existsId.values()),
      not_exists: Array.from(notExistsId.values()),
    };
  }

  protected abstract applyFilter(
    items: E[],
    filter: Filter | null,
  ): Promise<E[]>;

  protected applyPaginate(
    items: E[],
    page: SearchParams['page'],
    per_page: SearchParams['per_page'],
  ) {
    const start = (page - 1) * per_page;
    const limit = start + per_page;
    return items.slice(start, limit);
  }

  protected applySort(
    items: E[],
    sort: string | null,
    sort_dir: SortDirection | null,
  ) {
    if (!sort || !this.sortableFields.includes(sort)) {
      return items;
    }

    return [...items].sort((a, b) => {
      //@ts-ignore
      if (a[sort] < b[sort]) {
        return sort_dir === 'asc' ? -1 : 1;
      }
      //@ts-ignore
      if (a[sort] > b[sort]) {
        return sort_dir === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }
}
