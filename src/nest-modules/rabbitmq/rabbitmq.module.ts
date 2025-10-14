import {
  AmqpConnection,
  RabbitMQModule as GoLevelUpRabbitMQModule,
} from '@golevelup/nestjs-rabbitmq';
import { DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CONFIG_SCHEMA_TYPE } from '../config/config.module';
import { RabbitMQMessageBroker } from '@core/shared/infra/message-broker/rabbitmq/rabbitmq-message-broker';

type RabbitmqModuleOptions = {
  enableConsumers?: boolean;
};

export class RabbitmqModule {
  static forRoot(
    options: RabbitmqModuleOptions = { enableConsumers: false },
  ): DynamicModule {
    return {
      module: RabbitmqModule,
      global: true,
      imports: [
        GoLevelUpRabbitMQModule.forRootAsync({
          useFactory: (configService: ConfigService<CONFIG_SCHEMA_TYPE>) => {
            return {
              registerHandlers:
                options.enableConsumers ||
                configService.get('RABBITMQ_REGISTER_HANDLERS'),
              uri: configService.get('RABBITMQ_URI') ?? 'amqp://localhost:5672',
              exchanges: [
                {
                  name: 'dlx.exchange',
                  type: 'topic',
                },
              ],
              queues: [
                {
                  name: 'dlx.queue',
                  deadLetterExchange: 'dlx.exchange',
                  routingKey: '#',
                },
              ],
            };
          },
          inject: [ConfigService],
        }),
      ],
      exports: [GoLevelUpRabbitMQModule],
    };
  }

  static forFeature(): DynamicModule {
    return {
      module: RabbitmqModule,
      providers: [
        {
          provide: 'IMessageBroker',
          useFactory: (connection: AmqpConnection) => {
            return new RabbitMQMessageBroker(connection);
          },
          inject: [AmqpConnection],
        },
      ],
      exports: ['IMessageBroker'],
    };
  }
}
