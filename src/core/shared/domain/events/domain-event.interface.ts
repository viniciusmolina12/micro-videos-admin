import { ValueObject } from '../value-object';

export interface IDomainEvent {
  aggregate_id: ValueObject;
  occurred_on: Date;
  event_version: number;
  getIntegrationEvent?(): IIntegrationEvent;
}

export interface IIntegrationEvent<T = any> {
  occurred_on: Date;
  event_version: number;
  payload: T;
  event_name: string;
}
