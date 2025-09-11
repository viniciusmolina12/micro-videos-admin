import { IDomainEvent } from '../domain/events/domain-event.interface';

export interface IDomainEventListener {
  handle(event: IDomainEvent): Promise<void>;
}
