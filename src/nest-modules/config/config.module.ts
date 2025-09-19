import { Module } from '@nestjs/common';
import {
  ConfigModuleOptions,
  ConfigModule as NestConfigModule,
} from '@nestjs/config';
import Joi from 'joi';
import { join } from 'path';

//@ts-expect-error - the type is correct
const joiJson = Joi.extend((joi: any) => {
  return {
    type: 'object',
    base: joi.object(),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    coerce(value, _schema) {
      if (value[0] !== '{' && !/^\s*\{/.test(value)) {
        return;
      }

      try {
        return { value: JSON.parse(value) };
      } catch (err) {
        console.error(err);
      }
    },
  };
});
type DB_SCHEMA_TYPE = {
  DB_VENDOR: 'mysql' | 'sqlite';
  DB_HOST: string;
  DB_PORT: number;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_DATABASE: string;
  DB_LOGGING: boolean;
  DB_AUTO_LOAD_MODELS: boolean;
};

type CONFIG_GOOGLE_SCHEMA_TYPE = {
  GOOGLE_CLOUD_CREDENTIALS: object;
  GOOGLE_CLOUD_STORAGE_BUCKET_NAME: string;
};

export const CONFIG_GOOGLE_SCHEMA: Joi.StrictSchemaMap<CONFIG_GOOGLE_SCHEMA_TYPE> =
  {
    GOOGLE_CLOUD_CREDENTIALS: joiJson.object().required(),
    GOOGLE_CLOUD_STORAGE_BUCKET_NAME: Joi.string().required(),
  };

export const CONFIG_DB_SCHEMA: Joi.StrictSchemaMap<DB_SCHEMA_TYPE> = {
  DB_VENDOR: Joi.string().required().valid('mysql', 'sqlite'),
  DB_HOST: Joi.string().required(),
  DB_DATABASE: Joi.string().when('DB_VENDOR', {
    is: 'mysql',
    then: Joi.required(),
  }),
  DB_USERNAME: Joi.string().when('DB_VENDOR', {
    is: 'mysql',
    then: Joi.required(),
  }),
  DB_PASSWORD: Joi.string().when('DB_VENDOR', {
    is: 'mysql',
    then: Joi.required(),
  }),
  DB_PORT: Joi.number().integer().when('DB_VENDOR', {
    is: 'mysql',
    then: Joi.required(),
  }),
  DB_LOGGING: Joi.boolean().required(),
  DB_AUTO_LOAD_MODELS: Joi.boolean().required(),
};

type RABBITMQ_SCHEMA_TYPE = {
  RABBITMQ_URI: string;
};
export const RABBITMQ_SCHEMA: Joi.StrictSchemaMap<RABBITMQ_SCHEMA_TYPE> = {
  RABBITMQ_URI: Joi.string().required(),
};

export type CONFIG_SCHEMA_TYPE = DB_SCHEMA_TYPE &
  RABBITMQ_SCHEMA_TYPE &
  CONFIG_GOOGLE_SCHEMA_TYPE;

@Module({})
export class ConfigModule extends NestConfigModule {
  static forRoot(options: ConfigModuleOptions = {}) {
    const envFilePath = [
      join(process.cwd(), 'envs', `.env.${process.env.NODE_ENV}`),
      join(process.cwd(), 'envs', `.env`),
      ...(Array.isArray(options.envFilePath)
        ? options.envFilePath
        : [options.envFilePath]),
    ];

    return super.forRoot({
      isGlobal: true,
      envFilePath: envFilePath as any,
      validationSchema: Joi.object({
        ...CONFIG_DB_SCHEMA,
        ...CONFIG_GOOGLE_SCHEMA,
        ...RABBITMQ_SCHEMA,
      }),
      ...options,
    });
  }
}
