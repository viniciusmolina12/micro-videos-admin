import { Entity } from './entity';
import { IDomainEvent } from './events/domain-event.interface';
import EventEmitter2 from 'eventemitter2';

export abstract class AggregateRoot extends Entity {
  events: Set<IDomainEvent> = new Set<IDomainEvent>();
  dispatchEvents: Set<IDomainEvent> = new Set<IDomainEvent>();
  localMediator: EventEmitter2 = new EventEmitter2();

  applyEvent(event: IDomainEvent) {
    this.events.add(event);
    this.localMediator.emit(event.constructor.name, event);
  }

  registerHandler(event: string, handler: (event: IDomainEvent) => void) {
    this.localMediator.on(event, handler);
  }

  markEventAsDispatched(events: IDomainEvent) {
    this.dispatchEvents.add(events);
  }

  getUncommittedEvents() {
    return Array.from(this.events).filter(
      (event) => !this.dispatchEvents.has(event),
    );
  }

  clearEvents() {
    this.events.clear();
    this.dispatchEvents.clear();
  }
}
