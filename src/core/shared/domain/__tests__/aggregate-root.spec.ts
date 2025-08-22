import { AggregateRoot } from '../aggregate-root';
import { Uuid } from '../value-objects/uuid.vo';
import { IDomainEvent } from '../events/domain-event.interface';

class StubEvent implements IDomainEvent {
  occurred_on: Date;
  event_version: number = 1;
  constructor(
    public aggregate_id: Uuid,
    public name: string,
  ) {
    this.occurred_on = new Date();
  }
}

class StubAggregate extends AggregateRoot {
  aggregate_id: Uuid;
  name: string;
  field1: string;

  constructor(name: string, id: Uuid) {
    super();
    this.aggregate_id = id;
    this.name = name;
    this.registerHandler(StubEvent.name, this.onStubEvent.bind(this));
  }

  operation() {
    this.name = this.name.toUpperCase();
    this.applyEvent(new StubEvent(this.aggregate_id, this.name));
  }

  onStubEvent(event: StubEvent) {
    this.field1 = event.name;
  }

  get entity_id() {
    return this.aggregate_id;
  }

  toJSON() {
    return {
      id: this.aggregate_id.id,
      name: this.name,
    };
  }
}

describe('AggregateRoot', () => {
  it('dispatch events', () => {
    const id = new Uuid();
    const aggregate = new StubAggregate('test', id);
    aggregate.operation();
    expect(aggregate.field1).toBe('TEST');
  });
});
