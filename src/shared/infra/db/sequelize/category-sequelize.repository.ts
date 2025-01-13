import { Op } from "sequelize";
import { Category } from "../../../../category/domain/category.entity";
import { CategorySearchParams, CategorySearchResult, ICategoryRepository } from "../../../../category/domain/category.repository";
import { NotFoundError } from "../../../domain/errors/not-found.error";
import { Uuid } from "../../../domain/value-objects/uuid.vo";
import { CategoryModel } from "./category.model";

export class CategorySequelizeRepository implements ICategoryRepository {
    sortableFields: string[];
    constructor(private categoryModel: typeof CategoryModel) {}

    async insert(entity: Category): Promise<void> {
        await this.categoryModel.create({
            category_id: entity.category_id.id,
            name: entity.name,
            description: entity.description,
            is_active: entity.is_active,
            created_at: entity.created_at
        });
    }

    async bulkInsert(entities: Category[]): Promise<void> {
        await this.categoryModel.bulkCreate(entities.map(entity => ({
            category_id: entity.category_id.id,
            name: entity.name,
            description: entity.description,
            is_active: entity.is_active,
            created_at: entity.created_at
        })));
    }

    async update(entity: Category): Promise<void> {
        const id = entity.category_id.id;
        const model = await this._get(id);
        if(!model) throw new NotFoundError(id, this.getEntity());
        await this.categoryModel.update({
            name: entity.name,
            description: entity.description,
            created_at: entity.created_at,
            is_active: entity.is_active
        }, {
            where: { category_id: id }
        });
    }

    async delete(entity_id: Uuid): Promise<void> {
        const model = await this._get(entity_id.id);
        if(!model) throw new NotFoundError(entity_id, this.getEntity());
        await this.categoryModel.destroy({
            where: { category_id: entity_id.id }
        });
    }

    async findById(entity_id: Uuid): Promise<Category | null> {
        const model = await this._get(entity_id.id);
        return new Category({
            category_id: new Uuid(model.category_id),
            name: model.name,
            description: model.description,
            is_active: model.is_active,
            created_at: model.created_at
        });
    }

    private async _get(id: string): Promise<CategoryModel> {
        return await this.categoryModel.findByPk(id);
    }

    async findAll(): Promise<Category[]> {
        const models = await this.categoryModel.findAll();
        return models.map(model => new Category({
            category_id: new Uuid(model.category_id),
            name: model.name,
            description: model.description,
            is_active: model.is_active,
            created_at: model.created_at
        }));
    }
    getEntity(): new (...args: any[]) => Category {
        return Category;
    }
    async search(props: CategorySearchParams): Promise<CategorySearchResult> {
        const { rows: models, count } = await this.categoryModel.findAndCountAll({
            ...(props.filter && {
                where: {
                    name: {[Op.like]: `%${props.filter}%`}
                },
            }),

            ...(props.sort && this.sortableFields.includes(props.sort) && {
                order: [[props.sort || 'created_at', props.sort_dir || 'DESC']]
            }),
            offset: (props.page - 1) * props.per_page,
            limit: props.per_page
        })

        return new CategorySearchResult( {
            items: models.map(model => new Category({
                category_id: new Uuid(model.category_id),
                name: model.name,
                description: model.description,
                is_active: model.is_active,
                created_at: model.created_at
            })),
            total: count,
            current_page: props.page,
            per_page: props.per_page,
        });
    }
}