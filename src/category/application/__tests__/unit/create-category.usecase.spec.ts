import { CategoryInMemoryRepository } from "../../../../shared/infra/db/in-memory/category/category-in-memory.repository";
import { CreateCategoryUseCase } from "../../create-category.usecase"

describe('CreateCategoryUsecase unit tests', () => {
    let useCase: CreateCategoryUseCase;
    let repository: CategoryInMemoryRepository
    
    beforeEach(() => {
        repository = new CategoryInMemoryRepository();
        useCase = new CreateCategoryUseCase(repository);
    })

    it('should create a category', async () => {
        const spyInsert = jest.spyOn(repository, 'insert');
        const input = {
            name: 'Category 1'
        }
        const output = await useCase.execute(input);
        expect(output).toStrictEqual({
            id: expect.any(String),
            name: repository.items[0].name,
            description: null,
            is_active: true,
            created_at: expect.any(Date)
        });

        expect(spyInsert).toHaveBeenCalledTimes(1);
    })
});