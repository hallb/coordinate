import Dexie from "dexie";

/**
 * v001 schema per docs/02-solution/03-data-model.md.
 * Five aggregates → five object stores with indexes.
 */
export class CoordinateDB extends Dexie {
  persons!: Dexie.Table<
    {
      id: string;
      name: { givenName: string; familyName: string };
      dateOfBirth: string;
    },
    string
  >;
  households!: Dexie.Table<{ id: string; name: string }, string>;
  external_coverages!: Dexie.Table<
    {
      id: string;
      householdId: string;
      personId: string;
      insurerName: string;
      planType: string;
      cobPositionHint: string;
    },
    string
  >;
  coverages!: Dexie.Table<Record<string, unknown>, string>;
  expenses!: Dexie.Table<Record<string, unknown>, string>;

  constructor(name = "CoordinateDB") {
    super(name);
    this.version(1).stores({
      persons: "id, name.familyName, name.givenName",
      households: "id",
      external_coverages: "id, householdId, personId",
      coverages: "id, householdId, coverageType, active",
      expenses: "id, householdId, personId, serviceDate, category",
    });
  }
}

export const db = new CoordinateDB();
