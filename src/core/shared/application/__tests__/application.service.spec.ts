import { DomainEventMediator } from '@core/shared/domain/events/domain-event-mediator';
import { ApplicationService } from '../application.service';
import { UnitOfWorkFakeInMemory } from '@core/shared/infra/db/in-memory/fake-unit-of-work-in-memory';
import EventEmitter2 from 'eventemitter2';
import { AggregateRoot } from '@core/shared/domain/aggregate-root';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';

class StubAggregate extends AggregateRoot {
  get entity_id() {
    return new Uuid();
  }

  toJSON() {
    return {};
  }
}

describe('ApplicationService', () => {
  let appService: ApplicationService;
  let uow: UnitOfWorkFakeInMemory;
  let domainEventMediator: DomainEventMediator;

  beforeEach(() => {
    uow = new UnitOfWorkFakeInMemory();
    const eventEmitter = new EventEmitter2();
    domainEventMediator = new DomainEventMediator(eventEmitter);
    appService = new ApplicationService(uow, domainEventMediator);
  });

  describe('start', () => {
    it('should call the start method of the unit of work', async () => {
      const spyOnStart = jest.spyOn(uow, 'start');
      await appService.start();
      expect(spyOnStart).toHaveBeenCalledTimes(1);
    });
  });

  describe('fail', () => {
    it('should call the fail method of the unit of work', async () => {
      const spyOnFail = jest.spyOn(uow, 'rollback');
      await appService.fail();
      expect(spyOnFail).toHaveBeenCalledTimes(1);
    });
  });

  describe('finish', () => {
    it('should call the publish method of the domain event mediator and the commit method of the unit of work', async () => {
      const aggregateRoot = new StubAggregate();
      uow.addAggregateRoot(aggregateRoot);
      const spyOnPublish = jest.spyOn(domainEventMediator, 'publish');
      const spyOnPublishIntegrationEvent = jest.spyOn(
        domainEventMediator,
        'publishIntegrationEvent',
      );
      const spyOnCommit = jest.spyOn(uow, 'commit');
      await appService.finish();
      expect(spyOnPublish).toHaveBeenCalledWith(aggregateRoot);
      expect(spyOnPublishIntegrationEvent).toHaveBeenCalledWith(aggregateRoot);
      expect(spyOnCommit).toHaveBeenCalledTimes(1);
    });
  });

  describe('run', () => {
    it('should call the start method of the unit of work, the callback function and the finish method of the unit of work', async () => {
      const callback = jest.fn().mockResolvedValue('result');
      const spyOnStart = jest.spyOn(uow, 'start');
      const spyOnFinish = jest.spyOn(uow, 'commit');
      const spyOnFail = jest.spyOn(uow, 'rollback');
      const result = await appService.run(callback);

      expect(spyOnStart).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledTimes(1);
      expect(spyOnFinish).toHaveBeenCalledTimes(1);
      expect(spyOnFail).not.toHaveBeenCalled();
      expect(result).toBe('result');
    });

    it('should rollback and throw the error if the callback throws an error', async () => {
      const callback = jest.fn().mockRejectedValue(new Error('error'));
      const spyOnStart = jest.spyOn(uow, 'start');
      const spyOnFail = jest.spyOn(uow, 'rollback');
      await expect(appService.run(callback)).rejects.toThrow('error');
      expect(spyOnStart).toHaveBeenCalledTimes(1);
      expect(spyOnFail).toHaveBeenCalledTimes(1);
    });
  });
});
