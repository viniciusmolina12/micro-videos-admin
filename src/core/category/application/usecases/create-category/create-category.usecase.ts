import { IUseCase } from "../../../../shared/application/use-case.interface";
import { EntityValidationError } from "../../../../shared/domain/validators/validation.error";
import { Category } from "../../../domain/category.entity";
import { ICategoryRepository } from "../../../domain/category.repository";
import { CategoryOutput, CategoryOutputMapper } from "../@shared/category-output";
import { CreateCategoryInput } from "./create-category.input";

export class CreateCategoryUseCase implements IUseCase<CreateCategoryInput, CreateCategoryOutput> {
    constructor(private categoryRepository: ICategoryRepository) {}

    async execute(input: CreateCategoryInput): Promise<CreateCategoryOutput> {
        const entity = Category.create(input);        
        if(entity.notification.hasErrors()){
            throw new EntityValidationError(entity.notification.toJSON());
        }
        await this.categoryRepository.insert(entity);
        return CategoryOutputMapper.toOutput(entity);
    }
}



export type CreateCategoryOutput = CategoryOutput;