import { Either } from '@core/shared/domain/either';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import {
  CastMember,
  CastMemberId,
} from '@core/cast-member/domain/cast-member.aggregate';
import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';

export class CastMembersIdExistsInDatabaseValidator {
  constructor(private castMemberRepo: ICastMemberRepository) {}

  async validate(
    cast_members_id: string[],
  ): Promise<Either<CastMemberId[], NotFoundError[]>> {
    const castMembersId = cast_members_id.map((v) => new CastMemberId(v));

    const existsResult = await this.castMemberRepo.existsById(castMembersId);
    return existsResult.not_exists.length > 0
      ? Either.fail(
          existsResult.not_exists.map(
            (c) => new NotFoundError(c.id, CastMember),
          ),
        )
      : Either.ok(castMembersId);
  }
}
