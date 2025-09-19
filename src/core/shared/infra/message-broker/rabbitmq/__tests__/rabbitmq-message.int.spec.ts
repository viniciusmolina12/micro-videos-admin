import { RabbitMQMessageBroker } from '../rabbitmq-message-broker';
import { IIntegrationEvent } from '@core/shared/domain/events/domain-event.interface';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import { EVENTS_MESSAGE_BROKER_CONFIG } from '../events-message-broker-config';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Config } from '@core/shared/infra/config';

class TestEvent implements IIntegrationEvent {
  occurred_on: Date = new Date();
  event_version: number = 1;
  payload: any;
  event_name: string = 'TestEvent';
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

    // Criar o exchange correto para TestEvent
    await channel.assertExchange(
      EVENTS_MESSAGE_BROKER_CONFIG['TestEvent'].exchange,
      'direct',
      {
        durable: false,
      },
    );

    // Criar a fila
    await channel.assertQueue('test-queue-2', {
      durable: false,
    });
    await channel.purgeQueue('test-queue-2');

    // IMPORTANTE: Fazer o binding entre exchange e fila
    await channel.bindQueue(
      'test-queue-2',
      EVENTS_MESSAGE_BROKER_CONFIG['TestEvent'].exchange,
      EVENTS_MESSAGE_BROKER_CONFIG['TestEvent'].routingKey,
    );

    service = new RabbitMQMessageBroker(connection as any);
  });

  describe('publish', () => {
    it('should publish events to channel', async () => {
      const event = new TestEvent(new Uuid());

      await service.publishEvent(event);
      console.log('PUBLICOU');

      // Aguardar um pouco para garantir que a mensagem chegue
      await new Promise((resolve) => setTimeout(resolve, 100));

      const message: any = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout: mensagem não recebida em 5 segundos'));
        }, 5000);

        connection.channel.consume('test-queue-2', (msg) => {
          clearTimeout(timeout);
          if (msg) {
            connection.channel.ack(msg);
            resolve(msg);
          } else {
            reject(new Error('Mensagem nula recebida'));
          }
        });
      });
      const messageObject = JSON.parse(message.content.toString() || '{}');
      expect(messageObject).toEqual({
        aggregate_id: {
          id: event.aggregate_id.id,
        },
        event_name: event.event_name,
        occurred_on: event.occurred_on.toISOString(),
        event_version: event.event_version,
      });
    });
  });
});
