import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RabbitMQFakeConsumer {
  @RabbitSubscribe({
    exchange: 'amq.direct',
    routingKey: 'fake key',
    queue: 'fake-queue',
  })
  handle(event: any) {
    console.log('test event', event);
  }
}
