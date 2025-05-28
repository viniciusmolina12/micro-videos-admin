import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';

@Catch(NotFoundError)
export class NotFoundErrorFilter<T> implements ExceptionFilter {
  catch(exception: NotFoundError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const message = exception.message;
    response.status(404).json({
      error: 'Not Found',
      statusCode: 404,
      message,
    });
  }
}
