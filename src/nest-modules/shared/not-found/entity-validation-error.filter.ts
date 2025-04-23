import { EntityValidationError } from '@core/shared/domain/validators/validation.error';
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';

@Catch(EntityValidationError)
export class EntityValidationErrorFilter<T> implements ExceptionFilter {
  catch(exception: EntityValidationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    response.status(422).json({
      error: 'Unprocessable Entity',
      statusCode: 422,
      message: exception.error.flatMap((error) =>
        typeof error === 'string' ? error : Object.values(error).flat(),
      ),
    });
  }
}
