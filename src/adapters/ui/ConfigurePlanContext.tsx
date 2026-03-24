import React, { createContext, useContext, useMemo } from "react";
import type { ConfigurePlanUseCase } from "../../application/configure-plan-usecase";
import { db } from "../storage/db";
import { PersonDexieRepository } from "../storage/person-repository";
import { HouseholdDexieRepository } from "../storage/household-repository";
import { CoverageDexieRepository } from "../storage/coverage-repository";
import { ConfigurePlanUseCase as UseCase } from "../../application/configure-plan-usecase";

const ConfigurePlanContext = createContext<ConfigurePlanUseCase | null>(null);

export function ConfigurePlanProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const useCase = useMemo(() => {
    const personRepo = new PersonDexieRepository(db);
    const householdRepo = new HouseholdDexieRepository(db);
    const coverageRepo = new CoverageDexieRepository(db);
    return new UseCase(personRepo, householdRepo, coverageRepo);
  }, []);

  return (
    <ConfigurePlanContext.Provider value={useCase}>
      {children}
    </ConfigurePlanContext.Provider>
  );
}

export function useConfigurePlan(): ConfigurePlanUseCase {
  const ctx = useContext(ConfigurePlanContext);
  if (!ctx)
    throw new Error(
      "useConfigurePlan must be used within ConfigurePlanProvider"
    );
  return ctx;
}
