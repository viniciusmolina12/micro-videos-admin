import { AggregateRoot } from '@core/shared/domain/aggregate-root';
import { ValueObject } from '../../shared/domain/value-object';
import { CategoryId } from './value-objects/category-id.vo';
import { CategoryFakeBuilder } from './category-fake.builder';
import { CategoryValidatorFactory } from './category.validator';

export type CategoryConstructorProps = {
  category_id?: CategoryId;
  name: string;
  description?: string | null;
  is_active?: boolean;
  created_at?: Date;
};

export type CategoryCreateCommand = {
  name: string;
  description?: string | null;
  is_active?: boolean;
};

export class Category extends AggregateRoot {
  category_id: CategoryId;
  name: string;
  description?: string | null;
  is_active?: boolean;
  created_at: Date;

  constructor(props: CategoryConstructorProps) {
    super();
    this.category_id = props.category_id ?? new CategoryId();
    this.name = props.name;
    this.description = props.description ?? null;
    this.is_active = props.is_active ?? true;
    this.created_at = props.created_at ?? new Date();
  }

  static create(props: CategoryCreateCommand): Category {
    const category = new Category(props);
    category.validate(['name']);
    return category;
  }

  get entity_id(): ValueObject {
    return this.category_id!;
  }

  changeName(name: string): void {
    this.name = name;
    this.validate(['name']);
  }

  changeDescription(description: string): void {
    this.description = description;
  }

  activate() {
    this.is_active = true;
  }

  deactivate() {
    this.is_active = false;
  }

  validate(fields?: string[]) {
    const validator = CategoryValidatorFactory.create();
    return validator.validate(this.notification, this, fields);
  }

  static fake() {
    return CategoryFakeBuilder;
  }

  toJSON() {
    return {
      category_id: this.category_id?.id,
      name: this.name,
      description: this.description,
      is_active: this.is_active,
      created_at: this.created_at,
    };
  }
}
