import { Op } from 'sequelize';
import { Category } from '../../../../category/domain/category.aggregate';
import { CategoryId } from '../../../../category/domain/value-objects/category-id.vo';
import {
  CategorySearchParams,
  CategorySearchResult,
  ICategoryRepository,
} from '../../../../category/domain/category.repository';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { CategoryModel } from './category.model';
import { CategoryModelMapper } from './category-model-mapper';
import { UnitOfWorkSequelize } from './unit-of-work-sequelize';
import { InvalidArgumentError } from '@core/shared/domain/errors/invalid-argument.error';

export class CategorySequelizeRepository implements ICategoryRepository {
  sortableFields: string[] = ['name', 'created_at'];
  constructor(
    private categoryModel: typeof CategoryModel,
    private uow: UnitOfWorkSequelize,
  ) {}

  async insert(entity: Category): Promise<void> {
    const model = CategoryModelMapper.toModel(entity);
    await this.categoryModel.create(model.toJSON(), {
      transaction: this.uow.getTransaction(),
    });
  }

  async bulkInsert(entities: Category[]): Promise<void> {
    const models = entities.map((entity) =>
      CategoryModelMapper.toModel(entity).toJSON(),
    );
    await this.categoryModel.bulkCreate(models);
  }

  async existsById(ids: CategoryId[]): Promise<{
    exists: CategoryId[];
    not_exists: CategoryId[];
  }> {
    if (!ids.length) {
      throw new InvalidArgumentError(
        'ids must be an array with at least one element',
      );
    }

    const models = await this.categoryModel.findAll({
      where: {
        category_id: {
          [Op.in]: ids.map((id) => id.id),
        },
      },
      transaction: this.uow.getTransaction(),
    });
    const exists = models.map((m) => new CategoryId(m.category_id));
    const not_exists = ids.filter((id) => !exists.some((e) => e.equals(id)));
    return { exists, not_exists };
  }

  async update(entity: Category): Promise<void> {
    const id = entity.category_id?.id;
    const model = await this._get(id as string);
    if (!model) throw new NotFoundError(id, this.getEntity());

    const modelToUpdate = CategoryModelMapper.toModel(entity);
    await this.categoryModel.update(modelToUpdate.toJSON(), {
      where: { category_id: id },
      transaction: this.uow.getTransaction(),
    });
  }

  async delete(entity_id: CategoryId): Promise<void> {
    const model = await this._get(entity_id.id);
    if (!model) throw new NotFoundError(entity_id, this.getEntity());
    await this.categoryModel.destroy({
      where: { category_id: entity_id.id },
      transaction: this.uow.getTransaction(),
    });
  }

  async findById(entity_id: CategoryId): Promise<Category | null> {
    const model = await this._get(entity_id.id);
    return model ? CategoryModelMapper.toEntity(model) : null;
  }

  async findByIds(ids: CategoryId[]): Promise<Category[]> {
    const models = await this.categoryModel.findAll({
      where: {
        category_id: {
          [Op.in]: ids.map((id) => id.id),
        },
      },
      transaction: this.uow.getTransaction(),
    });
    return models.map((m) => CategoryModelMapper.toEntity(m));
  }

  private async _get(id: string): Promise<CategoryModel | null> {
    return await this.categoryModel.findByPk(id, {
      transaction: this.uow.getTransaction(),
    });
  }

  async findAll(): Promise<Category[]> {
    const models = await this.categoryModel.findAll({
      transaction: this.uow.getTransaction(),
    });
    return models.map((model) => CategoryModelMapper.toEntity(model));
  }
  async search(props: CategorySearchParams): Promise<CategorySearchResult> {
    const { rows: models, count } = await this.categoryModel.findAndCountAll({
      ...(props.filter && {
        where: {
          name: { [Op.like]: `%${props.filter}%` },
        },
      }),

      ...(props.sort && this.sortableFields.includes(props.sort)
        ? { order: [[props.sort, props.sort_dir || 'asc']] }
        : { order: [['created_at', 'desc']] }),
      offset: (props.page - 1) * props.per_page,
      limit: props.per_page,
      transaction: this.uow.getTransaction(),
    });

    return new CategorySearchResult({
      items: models.map((model) => CategoryModelMapper.toEntity(model)),
      total: count,
      current_page: props.page,
      per_page: props.per_page,
    });
  }
  getEntity(): new (...args: any[]) => Category {
    return Category;
  }
}
