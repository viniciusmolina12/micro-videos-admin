import { lastValueFrom, of } from 'rxjs';
import { WrapperDataInterceptor } from './wrapper-data.interceptor';
import exp from 'constants';

describe('WrapperDataInterceptor', () => {
  let interceptor: WrapperDataInterceptor;

  beforeEach(() => {
    interceptor = new WrapperDataInterceptor();
  });
  it('should wrapper with data key', async () => {
    const obs$ = interceptor.intercept({} as any, {
      handle: () => of({ name: 'test' }),
    });
    const result = await lastValueFrom(obs$);
    expect(result).toEqual({ data: { name: 'test' } });
    expect(interceptor).toBeDefined();
  });

  it('should not wrapper with data key', async () => {
    const obs$ = interceptor.intercept({} as any, {
      handle: () => of({ meta: 'test' }),
    });
    const result = await lastValueFrom(obs$);
    expect(result).toEqual({ meta: 'test' });
  });
});
