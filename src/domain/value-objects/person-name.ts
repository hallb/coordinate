/**
 * PersonName: value object with givenName, familyName (required), additionalNames (optional).
 * Display: givenName + familyName. Per 03-data-model.md.
 */
export interface PersonNameData {
  givenName: string;
  familyName: string;
  additionalNames?: string;
}

export class PersonName {
  private readonly _givenName: string;
  private readonly _familyName: string;
  private readonly _additionalNames: string | undefined;

  private constructor(data: PersonNameData) {
    const given = (data.givenName ?? "").trim();
    const family = (data.familyName ?? "").trim();
    if (!family) {
      throw new Error("PersonName familyName is required");
    }
    this._givenName = given;
    this._familyName = family;
    this._additionalNames = data.additionalNames?.trim() || undefined;
  }

  static create(data: PersonNameData): PersonName {
    return new PersonName(data);
  }

  get givenName(): string {
    return this._givenName;
  }

  get familyName(): string {
    return this._familyName;
  }

  get additionalNames(): string | undefined {
    return this._additionalNames;
  }

  /** Display format: givenName + familyName */
  get displayName(): string {
    const parts = [this._givenName, this._familyName].filter(Boolean);
    return parts.join(" ").trim() || this._familyName;
  }

  equals(other: PersonName): boolean {
    return (
      this._givenName === other._givenName &&
      this._familyName === other._familyName &&
      this._additionalNames === other._additionalNames
    );
  }
}
