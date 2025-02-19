import { Entity } from '../entity';

export class NotFoundError extends Error {
  constructor(id: any[] | any, entityClass: new (...args: any[]) => Entity) {
    const idsMessage = Array.isArray(id) ? id.join(',') : id;
    super(`${entityClass.name} Not found usind ID ${idsMessage}`);
    this.name = 'NotFoundError';
  }
}
