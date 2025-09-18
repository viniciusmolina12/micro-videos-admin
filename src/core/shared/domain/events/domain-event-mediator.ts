import EventEmitter2 from 'eventemitter2';
import { AggregateRoot } from '../aggregate-root';

export class DomainEventMediator {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  //This method is used only to tests purposes
  register(event: string, handler: (event: any) => void) {
    this.eventEmitter.on(event, handler);
  }

  async publish(aggregateRoot: AggregateRoot) {
    aggregateRoot.getUncommittedEvents().forEach(async (event) => {
      aggregateRoot.markEventAsDispatched(event);
      await this.eventEmitter.emitAsync(event.constructor.name, event);
    });
    aggregateRoot.events.clear();
  }

  async publishIntegrationEvent(aggregateRoot: AggregateRoot) {
    for (const event of aggregateRoot.events) {
      const integrationEvent = event.getIntegrationEvent?.();
      if (!integrationEvent) continue;
      await this.eventEmitter.emitAsync(
        integrationEvent.constructor.name,
        integrationEvent,
      );
    }
  }
}
