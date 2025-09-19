import { IMessageBroker } from '@core/shared/application/message-broker.interface';
import {
  IDomainEvent,
  IIntegrationEvent,
} from '@core/shared/domain/events/domain-event.interface';

export class InMemoryMessageBroker implements IMessageBroker {
  private handlers: {
    [key: string]: (event: IIntegrationEvent) => Promise<void>;
  } = {};
  constructor() {}

  async publishEvent(event: IIntegrationEvent): Promise<void> {
    const handler = this.handlers[event.constructor.name];
    if (handler) {
      await handler(event);
    }
  }
}
