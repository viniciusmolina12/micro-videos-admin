import {
  AmqpConnection,
  RabbitMQModule as GoLevelUpRabbitMQModule,
} from '@golevelup/nestjs-rabbitmq';
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CONFIG_SCHEMA_TYPE } from '../config/config.module';
import { RabbitMQMessageBroker } from '@core/shared/infra/message-broker/rabbitmq/rabbitmq-message-broker';
import { RabbitmqConsumeErrorFilter } from './rabbitmq-consume-error/rabbitmq-consume-error.filter';

export class RabbitmqModule {
  static forRoot(): DynamicModule {
    return {
      module: RabbitmqModule,
      global: true,
      imports: [
        GoLevelUpRabbitMQModule.forRootAsync({
          useFactory: (configService: ConfigService<CONFIG_SCHEMA_TYPE>) => {
            return {
              uri: configService.get('RABBITMQ_URI') as string,
              exchanges: [
                {
                  name: 'dlx.exchange',
                  type: 'topic',
                },
                {
                  name: 'direct.delayed',
                  type: 'x-delayed-message',
                  options: {
                    arguments: {
                      'x-delayed-type': 'direct',
                    },
                  },
                },
              ],
              queues: [
                {
                  name: 'dlx.queue',
                  exchange: 'dlx.exchange',
                  routingKey: '#',
                },
              ],
            };
          },
          inject: [ConfigService],
        }),
      ],
      providers: [RabbitmqConsumeErrorFilter],
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
