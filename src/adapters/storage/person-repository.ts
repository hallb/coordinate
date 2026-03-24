import type { PersonRepository as IPersonRepository } from "../../domain/ports/person-repository";
import type { PersonId } from "../../domain/ids";
import type { Person } from "../../domain/person";
import { CoordinateDB } from "./db";
import {
  personToRecord,
  recordToPerson,
  type PersonRecord,
} from "./serialization";

export class PersonDexieRepository implements IPersonRepository {
  constructor(private readonly db: CoordinateDB) {}

  async get(id: PersonId): Promise<Person | undefined> {
    const r = await this.db.persons.get(id);
    return r ? recordToPerson(r as PersonRecord) : undefined;
  }

  async getAll(): Promise<Person[]> {
    const rows = await this.db.persons.toArray();
    return rows.map((r) => recordToPerson(r as PersonRecord));
  }

  async save(person: Person): Promise<void> {
    await this.db.persons.put(personToRecord(person));
  }

  async delete(id: PersonId): Promise<void> {
    await this.db.persons.delete(id);
  }
}
