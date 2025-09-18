import { DomainEventMediator } from '../domain/events/domain-event-mediator';
import { IUnitOfWork } from '../domain/repository/unit-of-work.interface';

export class ApplicationService {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly domainEventMediator: DomainEventMediator,
  ) {}

  start(): Promise<void> {
    return this.unitOfWork.start();
  }

  async finish(): Promise<any> {
    const aggregateRoots = this.unitOfWork.getAggregateRoots();
    aggregateRoots.forEach(async (aggregateRoot) => {
      await this.domainEventMediator.publish(aggregateRoot);
    });
    await this.unitOfWork.commit();
    aggregateRoots.forEach(async (aggregateRoot) => {
      await this.domainEventMediator.publishIntegrationEvent(aggregateRoot);
    });
  }

  fail(): Promise<void> {
    return this.unitOfWork.rollback();
  }

  async run<T>(callback: (uow: IUnitOfWork) => Promise<T>): Promise<T> {
    await this.start();
    try {
      const result = await callback(this.unitOfWork);
      await this.finish();
      return result;
    } catch (error) {
      await this.fail();
      throw error;
    }
  }
}
