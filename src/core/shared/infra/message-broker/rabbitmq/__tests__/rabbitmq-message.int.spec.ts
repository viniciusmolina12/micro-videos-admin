import { RabbitMQMessageBroker } from '../rabbitmq-message-broker';
import { IDomainEvent } from '@core/shared/domain/events/domain-event.interface';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import { EVENTS_MESSAGE_BROKER_CONFIG } from '../events-message-broker-config';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Config } from '@core/shared/infra/config';

class TestEvent implements IDomainEvent {
  occurred_on: Date = new Date();
  event_version: number = 1;
  constructor(readonly aggregate_id: Uuid) {}
}

describe('RabbitMQMessageBroker Integration tests', () => {
  let service: RabbitMQMessageBroker;
  let connection: AmqpConnection;
  afterEach(async () => {
    try {
      await connection.close();
    } catch (error) {}
  });
  beforeEach(async () => {
    connection = new AmqpConnection({
      uri: Config.rabbitmqUri(),
      logger: {
        log: () => {},
        error: () => {},
        warn: () => {},
        debug: () => {},
        fatal: () => {},
      },
      connectionInitOptions: {
        wait: true,
      },
    });

    await connection.init();
    const channel = connection.channel;
    await channel.assertExchange(
      EVENTS_MESSAGE_BROKER_CONFIG[TestEvent.name].exchange,
      'direct',
      {
        durable: false,
      },
    );
    await channel.assertQueue('test-queue', {
      durable: false,
    });
    await channel.purgeQueue('test-queue');

    service = new RabbitMQMessageBroker(connection as any);
  });

  describe('publish', () => {
    it('should publish events to channel', async () => {
      const event = new TestEvent(new Uuid());

      await service.publishEvent(event);
      const message: any = await new Promise((resolve) => {
        connection.channel.consume('test-queue', (msg) => {
          resolve(msg);
        });
      });
      const messageObject = JSON.parse(message.content.toString() || '{}');
      expect(messageObject).toEqual({
        aggregate_id: {
          id: event.aggregate_id.id,
        },
        occurred_on: event.occurred_on.toISOString(),
        event_version: event.event_version,
      });
    });
  });
});
