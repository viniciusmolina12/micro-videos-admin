import { Entity } from "../../../domain/entity";
import { NotFoundError } from "../../../domain/errors/not-found.error";
import { Uuid } from "../../../domain/value-objects/uuid.vo";
import { InMemoryRepository } from "./in-memory.repository";

type StubEntityConstructor = {
    entity_id?: Uuid;
    name: string;
}
class StubEntity extends Entity {
    name: string;
    entity_id: Uuid;

    constructor(props: StubEntityConstructor) {
        super();
        this.entity_id = props.entity_id || new Uuid();
        this.name = props.name;
    }
    toJSON() {
        return {
            entity_id: this.entity_id,
            name: this.name
        }
    }
}

class StubInMemoryRepository extends InMemoryRepository<StubEntity, Uuid> {
    getEntity(): new (...args: any[]) => StubEntity {
        return StubEntity;
    }
}

describe('InMemoryRepository unit tests', () => {
    let repository: StubInMemoryRepository;

    beforeEach(() => {
        repository = new StubInMemoryRepository();
    })

    it('should insert a new entity', async() => {
        const entity = new StubEntity({ name: 'Test', entity_id: new Uuid() });
        await repository.insert(entity);
        expect(repository.items.length).toBe(1);
        expect(repository.items[0]).toBe(entity);
    })

    it('should bulk insert entities', async() => {
        const entities = [
            new StubEntity({ name: 'Test', entity_id: new Uuid() }),
            new StubEntity({ name: 'Test 2', entity_id: new Uuid() })
        ]
        await repository.bulkInsert(entities);
        expect(repository.items.length).toBe(2);
        expect(repository.items[0]).toBe(entities[0]);
        expect(repository.items[1]).toBe(entities[1]);
    })

    it('should update entity', async () => {
        const entity = new StubEntity({ name: 'Test', entity_id: new Uuid() });
        await repository.insert(entity);
        expect(repository.items[0].name).toBe('Test');
        expect(repository.items[0].entity_id.id).toBe(entity.entity_id.id);
        entity.name = 'Other test';
        await repository.update(entity);
        expect(repository.items[0].name).toBe('Other test');
        expect(repository.items[0].entity_id.id).toBe(entity.entity_id.id);
    })
    it('should throw an error if entity does not exist', async () => {
        const entity = new StubEntity({ name: 'Test', entity_id: new Uuid() });
        expect(repository.update(entity)).rejects.toThrow(new NotFoundError(entity.entity_id.id, StubEntity));
    })

    it('should delete an entity', async () => {
        const entity = new StubEntity({ name: 'Test', entity_id: new Uuid() });
        await repository.insert(entity);
        expect(repository.items.length).toBe(1);
        await repository.delete(entity.entity_id);
        expect(repository.items.length).toBe(0);
    })

    it('should throw an error when try to delete a non existent entity', async() => {
        const entity = new StubEntity({ name: 'Test', entity_id: new Uuid() });
        expect(repository.delete(entity.entity_id)).rejects.toThrow(new NotFoundError(entity.entity_id.id, StubEntity));
    })

    it('should find an entity by id', async() => {
        const entity = new StubEntity({ name: 'Test', entity_id: new Uuid() });
        await repository.insert(entity);
        const entityFound = await repository.findById(entity.entity_id);
        expect(entityFound.name).toBe('Test')
        expect(entityFound.entity_id.id).toBe(entity.entity_id.id);
    })

    it('should return null when try to find a non existent entity', async() => {
        const entity = new StubEntity({ name: 'Test', entity_id: new Uuid() });
        const entityFound = await repository.findById(entity.entity_id);
        expect(entityFound).toBeNull()
    })

    it('should find all entities', async() => {
        const entities = [
            new StubEntity({ name: 'Test', entity_id: new Uuid() }),
            new StubEntity({ name: 'Test 2', entity_id: new Uuid() }),
            new StubEntity({ name: 'Test 3', entity_id: new Uuid() })
        ]
        await repository.bulkInsert(entities);
        const entitiesFound = await repository.findAll();
        expect(entitiesFound.length).toBe(3);
    })
})