# Testing Strategy

## Test Pyramid

Unit, integration, and E2E test balance.

## Test Environments

Where tests run and with what data.

## Key Test Scenarios

Critical paths that must be covered.

## Performance / Load Testing

Approach and tooling.

## Mutation Testing

Mutation testing should be applied to the unit test suite to verify test quality and catch gaps in coverage. Mutants (small automated code changes) should fail tests at a high rate; a low mutation score indicates undertested logic. Tooling: e.g. Stryker (TypeScript/JavaScript).

## BDD-Style Tests

End-to-end tests that correspond to use case scenarios (as defined in the functional requirements) should be written in a BDD style (Given / When / Then). This keeps E2E tests readable by non-engineers and provides direct traceability from executable tests back to user-facing behaviour. Tooling: e.g. Cucumber or Playwright with a BDD layer.

## Acceptance Criteria Traceability

How tests map back to requirements.
