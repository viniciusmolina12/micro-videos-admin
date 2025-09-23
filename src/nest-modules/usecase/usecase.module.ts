import { ApplicationService } from '@core/shared/application/application.service';
import { DomainEventMediator } from '@core/shared/domain/events/domain-event-mediator';
import { IUnitOfWork } from '@core/shared/domain/repository/unit-of-work.interface';
import { Global, Module, Scope } from '@nestjs/common';

@Global()
@Module({
  providers: [
    {
      provide: ApplicationService,
      useFactory: (
        domainEventMediator: DomainEventMediator,
        uow: IUnitOfWork,
      ) => {
        return new ApplicationService(uow, domainEventMediator);
      },
      inject: [DomainEventMediator, 'UnitOfWork'],
      // scope: Scope.REQUEST,
    },
  ],
  exports: [ApplicationService],
})
export class UseCaseModule {}
