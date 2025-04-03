import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategorySequelizeRepository } from '@core/shared/infra/db/sequelize/category-sequelize.repository';
import { CreateCategoryUseCase } from '@core/category/application/usecases/create-category/create-category.usecase';
import { UpdateCategoryUseCase } from '@core/category/application/usecases/update-category/update-category.usecase';
import { DeleteCategoryUseCase } from '@core/category/application/usecases/delete-category/delete-category.usecase';
import { GetCategoryUseCase } from '@core/category/application/usecases/get-category/get-category.usecase';
import { ListCategoryUseCase } from '@core/category/application/usecases/list-category/list-category.usecase';
import { CategoryPresenter } from './categories.presenter';
import { CategoryOutput } from '@core/category/application/usecases/@shared/category-output';
import { UpdateCategoryInput } from '@core/category/application/usecases/update-category/update-category.input';

@Controller('categories')
export class CategoriesController {
  @Inject(CreateCategoryUseCase)
  private createUseCase: CreateCategoryUseCase;

  @Inject(UpdateCategoryUseCase)
  private updateUseCase: UpdateCategoryUseCase;

  @Inject(DeleteCategoryUseCase)
  private deleteUseCase: DeleteCategoryUseCase;

  @Inject(GetCategoryUseCase)
  private getUseCase: GetCategoryUseCase;

  @Inject(ListCategoryUseCase)
  private listUseCase: ListCategoryUseCase;

  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const output = await this.createUseCase.execute(createCategoryDto);
    return CategoriesController.serialize(output);
  }

  @Get()
  findAll() {}

  @Get(':id')
  findOne(@Param('id') id: string) {}

  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const output = await this.updateUseCase.execute({
      ...updateCategoryDto,
      id,
    });
    return CategoriesController.serialize(output);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {}

  static serialize(output: CategoryOutput): CategoryPresenter {
    return new CategoryPresenter(output);
  }
}
