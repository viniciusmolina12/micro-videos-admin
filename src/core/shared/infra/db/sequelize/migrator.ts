import { join } from 'path';
import { Sequelize } from 'sequelize-typescript';
import { SequelizeStorage, Umzug, UmzugOptions } from 'umzug';

export function migrator(
  sequelize: Sequelize,
  options?: Partial<UmzugOptions>,
) {
  return new Umzug({
    migrations: {
      glob: [
        '*/infra/db/sequelize/migrations/*.{ts,js}',
        {
          cwd: join(__dirname, '..', '..', '..', '..'),
          ignore: [
            '**/*.spec.ts',
            '**/*.e2e-spec.ts',
            '**/*.d.ts',
            '**/index.ts',
            '**/index.js',
          ],
        },
      ],
    },
    context: sequelize,
    storage: new SequelizeStorage({ sequelize }),
    ...options,
    logger: console,
  });
}
