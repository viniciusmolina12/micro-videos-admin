import {
  IDomainEvent,
  IIntegrationEvent,
} from '../domain/events/domain-event.interface';

export interface IDomainEventListener {
  handle(event: IDomainEvent): Promise<void>;
}

export interface IIntegrationEventListener {
  handle(event: IIntegrationEvent): Promise<void>;
}
