import { EventEmitter2 } from 'eventemitter2';
import { DomainEventMediator } from '../domain-event-mediator';
import { AggregateRoot } from '../../aggregate-root';
import { IDomainEvent, IIntegrationEvent } from '../domain-event.interface';
import { ValueObject } from '../../value-object';
import { Uuid } from '../../value-objects/uuid.vo';

class StubDomainEvent implements IDomainEvent {
  readonly occurred_on: Date;
  readonly event_version: number;

  constructor(
    public readonly aggregate_id: Uuid,
    public name: string,
  ) {
    this.occurred_on = new Date();
    this.event_version = 1;
    this.name = name;
  }

  getIntegrationEvent(): IIntegrationEvent {
    return new StubIntegrationEvent(this);
  }
}

class StubIntegrationEvent implements IIntegrationEvent {
  occurred_on: Date;
  event_version: number;
  payload: any;
  event_name: string;

  constructor(stubDomainEvent: StubDomainEvent) {
    this.occurred_on = stubDomainEvent.occurred_on;
    this.event_version = stubDomainEvent.event_version;
    this.payload = stubDomainEvent;
    this.event_name = this.constructor.name;
  }
}

class StubDomainEventProps {
  readonly name: string;
}

class StubAggregate extends AggregateRoot {
  id: Uuid;
  name: string;

  get entity_id() {
    return this.id;
  }

  action(name: string) {
    this.name = name;
    this.applyEvent(new StubDomainEvent(this.id, name));
  }

  toJSON(): any {
    return {
      id: this.id.id,
      name: this.name,
    };
  }
}

describe('DomainEventMediator', () => {
  let mediator: DomainEventMediator;
  beforeEach(() => {
    const eventEmitter = new EventEmitter2();
    mediator = new DomainEventMediator(eventEmitter);
  });

  it('should register handler', async () => {
    expect.assertions(1);
    mediator.register(StubDomainEvent.name, (event: StubDomainEvent) => {
      expect(event.name).toBe('test');
    });

    const aggregate = new StubAggregate();
    aggregate.action('test');
    await mediator.publish(aggregate);
  });

  it('should publish integration event', async () => {
    expect.assertions(1);
    const aggregate = new StubAggregate();
    aggregate.action('test');
    mediator.register(
      StubIntegrationEvent.name,
      (event: StubIntegrationEvent) => {
        expect(event.payload.name).toBe('test');
      },
    );
    await mediator.publishIntegrationEvent(aggregate);
  });
});
