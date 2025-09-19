import {
  AmqpConnection,
  RabbitMQModule as GoLevelUpRabbitMQModule,
} from '@golevelup/nestjs-rabbitmq';
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CONFIG_SCHEMA_TYPE } from '../config/config.module';
import { RabbitMQMessageBroker } from '@core/shared/infra/message-broker/rabbitmq/rabbitmq-message-broker';

export class RabbitmqModule {
  static forRoot(): DynamicModule {
    return {
      module: RabbitmqModule,
      global: true,
      imports: [
        GoLevelUpRabbitMQModule.forRootAsync({
          useFactory: (configService: ConfigService<CONFIG_SCHEMA_TYPE>) => {
            return {
              uri: configService.get('RABBITMQ_URI'),
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
