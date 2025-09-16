import EventEmitter2 from 'eventemitter2';
import { AggregateRoot } from '../aggregate-root';

export class DomainEventMediator {
  constructor(private readonly eventEmitter: EventEmitter2) {}

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
}
