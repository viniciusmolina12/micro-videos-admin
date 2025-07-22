import { Transform } from 'class-transformer';
import { ListCastMembersOutput } from '@core/cast-member/application/usecases/list-cast-member/list-cast-members.usecase';
import { CastMemberTypes } from '@core/cast-member/domain/cast-member-type.vo';
import { CastMemberOutput } from '@core/cast-member/application/usecases/common/cast-member-output';
import { CollectionPresenter } from '../shared/collection.presenter';
export class CastMemberPresenter {
  id: string;
  name: string;
  type: CastMemberTypes;
  @Transform(({ value }: { value: Date }) => {
    return value.toISOString();
  })
  created_at: Date;

  constructor(output: CastMemberOutput) {
    this.id = output.id;
    this.name = output.name;
    this.type = output.type;
    this.created_at = output.created_at;
  }
}

export class CastMemberCollectionPresenter extends CollectionPresenter {
  data: CastMemberPresenter[];
  //sugestão de reuso
  // constructor(output: CastMemberOutput[], paginationProps){

  // }

  constructor(output: ListCastMembersOutput) {
    const { items, ...paginationProps } = output;
    super(paginationProps);
    this.data = items.map((item) => new CastMemberPresenter(item));
  }
}
