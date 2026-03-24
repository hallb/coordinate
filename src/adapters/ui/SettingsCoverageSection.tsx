import React, { useEffect, useState } from "react";
import {
  Card,
  List,
  Button,
  Drawer,
  Steps,
  Form,
  Input,
  InputNumber,
  Select,
  message,
} from "antd";
import type { FormInstance } from "antd/es/form";
import { useConfigurePlan } from "./ConfigurePlanContext";
import type { Coverage } from "../../domain/coverage";
import type { Household } from "../../domain/household";
import { PLAN_TYPES } from "../../domain/value-objects/plan-type";
import { LIMIT_WINDOW_MODES } from "../../domain/value-objects/limit-window-mode";
import {
  coverageToFormValues,
  mergeCoverageFromForm,
  type CoverageFormValues,
} from "./coverage-edit-helpers";
import {
  EMPTY_COVERAGE_WIZARD_VALUES,
  buildCreateCoveragePayload,
  normalizeOptionalNumber,
} from "./coverage-wizard-defaults";

const DEFAULT_HOUSEHOLD_ID = "h-default";

function resetCoverageWizardForm(form: FormInstance): void {
  form.resetFields();
  form.setFieldsValue(EMPTY_COVERAGE_WIZARD_VALUES);
}

export function SettingsCoverageSection(): React.ReactElement {
  const useCase = useConfigurePlan();
  const [coverages, setCoverages] = useState<Coverage[]>([]);
  const [_household, setHousehold] = useState<Household | undefined>();
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCoverageId, setEditingCoverageId] = useState<string | null>(
    null
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();

  const load = async (): Promise<void> => {
    setLoading(true);
    try {
      const h = await useCase.getHousehold(DEFAULT_HOUSEHOLD_ID);
      setHousehold(h);
      if (h) {
        const list = await useCase.getCoveragesByHousehold(h.id);
        setCoverages(list);
      } else {
        setCoverages([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closeDrawer = (): void => {
    setDrawerOpen(false);
    setEditingCoverageId(null);
    resetCoverageWizardForm(form);
  };

  const handleCreateCoverage = (): void => {
    setEditingCoverageId(null);
    resetCoverageWizardForm(form);
    setCurrentStep(0);
    setDrawerOpen(true);
  };

  const handleEditCoverage = (c: Coverage): void => {
    setEditingCoverageId(c.id);
    form.setFieldsValue(coverageToFormValues(c));
    setCurrentStep(0);
    setDrawerOpen(true);
  };

  const steps = [
    { title: "Insurer & plan" },
    { title: "Plan year" },
    { title: "Benefit categories" },
    { title: "Annual maxima" },
    { title: "COB priority" },
  ];

  const onFinish = async (): Promise<void> => {
    // getFieldsValue() only includes mounted fields; wizard steps unmount prior steps.
    // true => full store (preserved values), required for insurerName etc. on final step.
    const raw = form.getFieldsValue(true) as CoverageFormValues;
    try {
      if (editingCoverageId) {
        const existing = await useCase.getCoverage(editingCoverageId);
        if (!existing) {
          message.error("Coverage not found");
          return;
        }
        const updated = mergeCoverageFromForm(existing, raw);
        await useCase.saveCoverage(updated);
        message.success("Coverage updated");
      } else {
        const persons = await useCase.listPersons();
        const insuredId = persons[0]?.id ?? "p-default";
        const covId = `cov-${Date.now()}`;
        const payload = buildCreateCoveragePayload(raw, {
          covId,
          householdId: DEFAULT_HOUSEHOLD_ID,
          insuredPersonId: insuredId,
        });
        await useCase.createCoverage(payload);
        message.success("Coverage added");
      }
      closeDrawer();
      load();
    } catch (e) {
      message.error(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <>
      <Card title="Coverages" loading={loading} style={{ marginTop: 16 }}>
        <List
          dataSource={coverages}
          renderItem={(c) => (
            <List.Item
              actions={[
                <Button
                  key="edit"
                  type="link"
                  onClick={() => handleEditCoverage(c)}
                >
                  Edit
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={
                  <span>
                    <strong>Insurer:</strong> {c.insurer.name || "—"}{" "}
                    <span style={{ color: "var(--ant-color-text-secondary)" }}>
                      · {c.coverageType}
                    </span>
                  </span>
                }
                description={`Plan year starts ${c.planYearStart.value}`}
              />
            </List.Item>
          )}
        />
        <Button
          type="primary"
          onClick={handleCreateCoverage}
          style={{ marginTop: 8 }}
        >
          Add coverage
        </Button>
      </Card>
      <Drawer
        title={editingCoverageId ? "Edit coverage" : "Add coverage"}
        open={drawerOpen}
        onClose={closeDrawer}
        width={480}
        footer={
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Button onClick={closeDrawer}>Cancel</Button>
            {currentStep < steps.length - 1 ? (
              <Button
                type="primary"
                onClick={() => setCurrentStep((s) => s + 1)}
              >
                Next
              </Button>
            ) : (
              <Button type="primary" onClick={() => onFinish()}>
                Save
              </Button>
            )}
          </div>
        }
      >
        <Steps current={currentStep} size="small" style={{ marginBottom: 24 }}>
          {steps.map((s, i) => (
            <Steps.Step key={i} title={s.title} />
          ))}
        </Steps>
        <Form form={form} layout="vertical">
          {currentStep === 0 && (
            <>
              <Form.Item
                name="insurerName"
                label="Insurer name"
                rules={[{ required: true }]}
              >
                <Input placeholder="e.g. Sun Life" />
              </Form.Item>
              <Form.Item name="portalUrl" label="Portal URL" extra="Optional.">
                <Input type="url" placeholder="https://... (optional)" />
              </Form.Item>
              <Form.Item
                name="coverageType"
                label="Plan type"
                rules={[{ required: true }]}
              >
                <Select
                  options={PLAN_TYPES.map((t) => ({ label: t, value: t }))}
                  placeholder="Select"
                />
              </Form.Item>
              <Form.Item
                name="effectiveDate"
                label="Effective date"
                extra="Optional — a default is used at save if left blank."
              >
                <Input placeholder="YYYY-MM-DD (optional)" />
              </Form.Item>
            </>
          )}
          {currentStep === 1 && (
            <>
              <Form.Item
                name="planYearStart"
                label="Plan year start (MM-DD)"
                extra="Optional — default 01-01 applied at save if blank."
              >
                <Input placeholder="MM-DD (optional)" />
              </Form.Item>
              <Form.Item
                name="gracePeriodDays"
                label="Grace period (days)"
                extra="Optional — default 90 days at save if blank."
                normalize={normalizeOptionalNumber}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </>
          )}
          {currentStep === 2 && (
            <>
              <Form.Item
                name="categoryName"
                label="Benefit category name"
                extra="Optional — default name applied at save if blank."
              >
                <Input placeholder="e.g. Paramedical (optional)" />
              </Form.Item>
              <Form.Item
                name="limitWindowMode"
                label="Limit window"
                extra="Optional — default plan year window at save if unset."
              >
                <Select
                  allowClear
                  placeholder="Select or leave empty for default"
                  options={LIMIT_WINDOW_MODES.map((m) => ({
                    label: m,
                    value: m,
                  }))}
                />
              </Form.Item>
              <Form.Item
                name="limitCycleMonths"
                label="Cycle months"
                extra="Optional — default 12 months at save if blank."
                normalize={normalizeOptionalNumber}
              >
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            </>
          )}
          {currentStep === 3 && (
            <Form.Item
              name="limit"
              label="Annual maximum ($)"
              extra="Optional — default limit applied at save if blank."
              normalize={normalizeOptionalNumber}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          )}
          {currentStep === 4 && (
            <Form.Item
              name="cobPriority"
              label="COB priority"
              extra="Optional. Leave empty for CLHIA default order."
              normalize={normalizeOptionalNumber}
            >
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          )}
        </Form>
      </Drawer>
    </>
  );
}
