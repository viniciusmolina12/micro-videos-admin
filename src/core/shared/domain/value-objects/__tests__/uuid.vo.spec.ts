import { InvalidUuidError, Uuid } from '../uuid.vo';

describe('Uuid Unit Tests', () => {
  const validateSpy = jest.spyOn(Uuid.prototype as any, 'validate');
  it('should throw an error when uuid is invalid', () => {
    expect(() => {
      new Uuid('invalid-uuid');
    }).toThrow(new InvalidUuidError());
    expect(validateSpy).toHaveBeenCalledTimes(1);
  });

  it('should create a valid uuid', () => {
    const uuid = new Uuid();
    expect(uuid.id).toBeDefined();
  });

  it('should accept a valid uuid', () => {
    const uuid = new Uuid('f1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d');
    expect(uuid.id).toBe('f1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d');
  });
});
