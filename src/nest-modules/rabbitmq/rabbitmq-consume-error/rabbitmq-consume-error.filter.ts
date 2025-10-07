import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';
import { AmqpConnection, Nack } from '@golevelup/nestjs-rabbitmq';
import { ConsumeMessage, MessagePropertyHeaders } from 'amqplib';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  UnprocessableEntityException,
} from '@nestjs/common';

@Catch()
export class RabbitmqConsumeErrorFilter<T> implements ExceptionFilter {
  static readonly RETRY_COUNT_HEADER = 'x-retry-count';
  static readonly MAX_RETRY_COUNT = 3;
  static readonly NON_RETRIABLE_ERRORS = [
    NotFoundError,
    EntityValidationError,
    UnprocessableEntityException,
  ];
  static readonly RETRY_DELAY = 5000;

  constructor(private readonly amqpConnection: AmqpConnection) {}

  async catch(exception: Error, host: ArgumentsHost) {
    if (host.getType<'rmq'>() !== 'rmq') {
      return;
    }

    const hasNonRetriableError =
      RabbitmqConsumeErrorFilter.NON_RETRIABLE_ERRORS.some(
        (error) => exception instanceof error,
      );

    if (hasNonRetriableError) {
      return new Nack(false);
    }

    const ctx = host.switchToRpc();
    const message: ConsumeMessage = ctx.getContext();

    if (
      this.shouldRetry(message.properties.headers as MessagePropertyHeaders)
    ) {
      await this.retry(message);
    } else {
      return new Nack(false);
    }
  }

  private shouldRetry(messageHeaders: MessagePropertyHeaders): boolean {
    const retryHeader = RabbitmqConsumeErrorFilter.RETRY_COUNT_HEADER;
    const maxRetries = RabbitmqConsumeErrorFilter.MAX_RETRY_COUNT;

    return (
      !(retryHeader in messageHeaders) ||
      messageHeaders[retryHeader] < maxRetries
    );
  }

  private async retry(message: ConsumeMessage) {
    const messageHeaders = message.properties.headers as MessagePropertyHeaders;
    const retryHeader = RabbitmqConsumeErrorFilter.RETRY_COUNT_HEADER;
    messageHeaders[retryHeader] = messageHeaders[retryHeader]
      ? (messageHeaders[retryHeader] as number) + 1
      : 1;
    messageHeaders['x-delay'] = RabbitmqConsumeErrorFilter.RETRY_DELAY;
    message.properties.headers = messageHeaders;
    await this.amqpConnection.publish(
      'direct.delayed',
      message.fields.routingKey,
      message.content,
      {
        headers: messageHeaders,
        correlationId: message.properties.correlationId,
      },
    );
    return message;
  }
}
