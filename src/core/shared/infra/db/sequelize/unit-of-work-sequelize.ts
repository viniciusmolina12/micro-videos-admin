import { IUnitOfWork } from '@core/shared/domain/repository/unit-of-work.interface';
import { Sequelize, Transaction } from 'sequelize';

export class UnitOfWorkSequelize implements IUnitOfWork {
  private transaction: Transaction | null;
  constructor(private readonly sequelize: Sequelize) {}

  async start(): Promise<void> {
    if (!this.transaction) {
      this.transaction = await this.sequelize.transaction();
    }
  }

  async commit(): Promise<void> {
    this.validateTransaction();
    await this.transaction!.commit();
    this.transaction = null;
  }

  async rollback(): Promise<void> {
    this.validateTransaction();
    await this.transaction!.rollback();
    this.transaction = null;
  }

  getTransaction(): any {
    return this.transaction;
  }

  async do<T>(workFn: (uow: IUnitOfWork) => Promise<T>): Promise<T> {
    let isAutoTransaction = false;

    try {
      if (this.transaction) {
        const result = await workFn(this);
        this.transaction = null;
        return result;
      }

      return await this.sequelize.transaction(async (transaction) => {
        isAutoTransaction = true;
        this.transaction = transaction;
        const result = await workFn(this);
        this.transaction = null;
        return result;
      });
    } catch (error) {
      if (!isAutoTransaction) {
        this.transaction?.rollback();
      }

      this.transaction = null;
      throw error;
    }
  }

  private validateTransaction() {
    if (!this.transaction) {
      throw new Error('Transaction not started');
    }
  }
}
