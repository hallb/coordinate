/**
 * Insurer: value object with name (required), portalUrl (optional).
 * Per 03-data-model.md.
 */
export interface InsurerData {
  name: string;
  portalUrl?: string;
}

export class Insurer {
  private readonly _name: string;
  private readonly _portalUrl: string | undefined;

  private constructor(data: InsurerData) {
    const name = (data.name ?? "").trim();
    if (!name) {
      throw new Error("Insurer name is required");
    }
    this._name = name;
    this._portalUrl = data.portalUrl?.trim() || undefined;
  }

  static create(data: InsurerData): Insurer {
    return new Insurer(data);
  }

  get name(): string {
    return this._name;
  }

  get portalUrl(): string | undefined {
    return this._portalUrl;
  }

  equals(other: Insurer): boolean {
    return this._name === other._name && this._portalUrl === other._portalUrl;
  }
}
