import type { PersonId } from "../ids";
import type { Person } from "../person";

/**
 * Port for Person persistence. Per ADR-001.
 */
export interface PersonRepository {
  get(id: PersonId): Promise<Person | undefined>;
  getAll(): Promise<Person[]>;
  save(person: Person): Promise<void>;
  delete(id: PersonId): Promise<void>;
}
