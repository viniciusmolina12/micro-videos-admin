import { Sequelize } from 'sequelize-typescript';
import { Category } from '../../../../../category/domain/category.entity';
import { Uuid } from '../../../../domain/value-objects/uuid.vo';
import { CategoryModel } from '../category.model';
import { CategoryModelMapper } from '../category-model-mapper';
import { setupSequelize } from '../../../testing/helpers';

describe('CategoryModelMapper Integration Tests', () => {
 setupSequelize({models: [CategoryModel]});
  it('should convert a category model to a category aggregate', () => {
    const created_at = new Date();
    const model = CategoryModel.build({
      category_id: '5490020a-e866-4229-9adc-aa44b83234c4',
      name: 'some value',
      description: 'some description',
      is_active: true,
      created_at,
    });
    const aggregate = CategoryModelMapper.toEntity(model);
    expect(aggregate.toJSON()).toStrictEqual(
      new Category({
        category_id: new Uuid('5490020a-e866-4229-9adc-aa44b83234c4'),
        name: 'some value',
        description: 'some description',
        is_active: true,
        created_at,
      }).toJSON(),
    );
  });

  it('should convert category entity to category model', () => {
    const created_at = new Date();
    const entity = Category
        .fake()
        .aCategory()
        .withCategoryId(new Uuid('5490020a-e866-4229-9adc-aa44b83234c4'))
        .withCreatedAt(created_at)
        .withDescription('some description')
        .withName('some value')
        .build();
    const model = CategoryModelMapper.toModel(entity);
    expect(model.toJSON()).toStrictEqual({
      category_id: '5490020a-e866-4229-9adc-aa44b83234c4',
      name: 'some value',
      description: 'some description',
      is_active: true,
      created_at,
    });
  })
});