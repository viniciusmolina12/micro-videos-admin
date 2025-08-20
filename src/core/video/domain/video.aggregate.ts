import { CastMemberId } from '@core/cast-member/domain/cast-member.aggregate';
import { CategoryId } from '@core/category/domain/value-objects/category-id.vo';
import { GenreId } from '@core/genre/domain/genre.aggregate';
import { AggregateRoot } from '@core/shared/domain/aggregate-root';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import { Rating } from './rating.vo';
import { Banner } from './banner.vo';

export class VideoId extends Uuid {}

export type VideoConstructorProps = {
  id?: VideoId;
  title: string;
  description: string;
  year_launched: number;
  duration: number;
  rating: Rating;
  is_opened: boolean;
  is_published: boolean;
  banner?: Banner;
  categories_id: Map<string, CategoryId>;
  genres_id: Map<string, GenreId>;
  cast_members_id: Map<string, CastMemberId>;
  created_at?: Date;
};

export type VideoCreateCommand = {
  title: string;
  description: string;
  year_launched: number;
  duration: number;
  rating: Rating;
  is_opened: boolean;
  is_published: boolean;
  banner?: Banner;
  categories_id: CategoryId[];
  genres_id: GenreId[];
  cast_members_id: CastMemberId[];
};

export class Video extends AggregateRoot {
  id: VideoId;
  title: string;
  description: string;
  year_launched: number;
  duration: number;
  rating: Rating;
  is_opened: boolean;
  is_published: boolean;
  banner: Banner | null;
  categories_id: Map<string, CategoryId>;
  genres_id: Map<string, GenreId>;
  cast_members_id: Map<string, CastMemberId>;
  created_at: Date;

  constructor(props: VideoConstructorProps) {
    super();
    this.id = props.id ?? new VideoId();
    this.title = props.title;
    this.description = props.description;
    this.year_launched = props.year_launched;
    this.duration = props.duration;
    this.banner = props.banner ?? null;
    this.rating = props.rating;
    this.is_opened = props.is_opened;
    this.is_published = props.is_published;
    this.created_at = props.created_at ?? new Date();
  }

  static create(props: VideoCreateCommand): Video {
    const video = new Video({
      ...props,
      categories_id: new Map(
        props.categories_id.map((category_id) => [category_id.id, category_id]),
      ),
      genres_id: new Map(
        props.genres_id.map((genre_id) => [genre_id.id, genre_id]),
      ),
      cast_members_id: new Map(
        props.cast_members_id.map((cast_member_id) => [
          cast_member_id.id,
          cast_member_id,
        ]),
      ),
    });
    // video.validate();
    return video;
  }

  changeTitle(title: string): void {
    this.title = title;
    // this.validate(['title']);
  }

  changeDescription(description: string): void {
    this.description = description;
    // this.validate(['description']);
  }

  changeYearLaunched(year_launched: number): void {
    this.year_launched = year_launched;
    // this.validate(['year_launched']);
  }

  changeDuration(duration: number): void {
    this.duration = duration;
    // this.validate(['duration']);
  }

  changeRating(rating: Rating): void {
    this.rating = rating;
    // this.validate(['rating']);
  }

  markAsOpened(): void {
    this.is_opened = true;
  }

  markAsNotOpened(): void {
    this.is_opened = false;
  }

  addCategoryId(category_id: CategoryId): void {
    this.categories_id.set(category_id.id, category_id);
  }

  removeCategoryId(category_id: CategoryId): void {
    this.categories_id.delete(category_id.id);
  }

  syncCategoriesId(categories_id: CategoryId[]): void {
    if (categories_id.length === 0) {
      this.categories_id.clear();
      return;
    }
    this.categories_id = new Map(
      categories_id.map((category_id) => [category_id.id, category_id]),
    );
  }

  addGenreId(genre_id: GenreId): void {
    this.genres_id.set(genre_id.id, genre_id);
  }

  removeGenreId(genre_id: GenreId): void {
    this.genres_id.delete(genre_id.id);
  }

  syncGenresId(genres_id: GenreId[]): void {
    if (genres_id.length === 0) {
      this.genres_id.clear();
      return;
    }
    this.genres_id = new Map(
      genres_id.map((genre_id) => [genre_id.id, genre_id]),
    );
  }

  addCastMemberId(cast_member_id: CastMemberId): void {
    this.cast_members_id.set(cast_member_id.id, cast_member_id);
  }

  removeCastMemberId(cast_member_id: CastMemberId): void {
    this.cast_members_id.delete(cast_member_id.id);
  }

  syncCastMembersId(cast_members_id: CastMemberId[]): void {
    if (cast_members_id.length === 0) {
      this.cast_members_id.clear();
      return;
    }
    this.cast_members_id = new Map(
      cast_members_id.map((cast_member_id) => [
        cast_member_id.id,
        cast_member_id,
      ]),
    );
  }

  get entity_id() {
    return this.id;
  }

  toJSON() {
    return {
      id: this.id.id,
      title: this.title,
      description: this.description,
      year_launched: this.year_launched,
      duration: this.duration,
      is_opened: this.is_opened,
      is_published: this.is_published,
      categories_id: Array.from(this.categories_id.values()),
      genres_id: Array.from(this.genres_id.values()),
      cast_members_id: Array.from(this.cast_members_id.values()),
      created_at: this.created_at,
    };
  }
}
