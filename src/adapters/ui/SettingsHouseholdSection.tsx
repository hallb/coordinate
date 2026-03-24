import React, { useEffect, useState } from "react";
import {
  Card,
  List,
  Button,
  Form,
  Input,
  DatePicker,
  Modal,
  message,
} from "antd";
import { useConfigurePlan } from "./ConfigurePlanContext";
import { Person } from "../../domain/person";
import { PersonName } from "../../domain/value-objects/person-name";
import type { Household } from "../../domain/household";
import { CalendarDate } from "../../domain/value-objects/calendar-date";
import dayjs from "dayjs";

const DEFAULT_HOUSEHOLD_ID = "h-default";
const DEFAULT_HOUSEHOLD_NAME = "My Household";

export function SettingsHouseholdSection(): React.ReactElement {
  const useCase = useConfigurePlan();
  const [household, setHousehold] = useState<Household | undefined>();
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [form] = Form.useForm();

  const load = async (): Promise<void> => {
    setLoading(true);
    try {
      let h = await useCase.getHousehold(DEFAULT_HOUSEHOLD_ID);
      if (!h) {
        h = await useCase.createHousehold({
          id: DEFAULT_HOUSEHOLD_ID,
          name: DEFAULT_HOUSEHOLD_NAME,
        });
      }
      setHousehold(h);
      const allPersons = await useCase.listPersons();
      setPersons(allPersons);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddPerson = (): void => {
    setEditingPerson(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEditPerson = (person: Person): void => {
    setEditingPerson(person);
    form.setFieldsValue({
      givenName: person.name.givenName,
      familyName: person.name.familyName,
      dateOfBirth: dayjs(person.dateOfBirth.iso),
    });
    setModalOpen(true);
  };

  const handleSubmit = async (): Promise<void> => {
    const values = await form.validateFields();
    const dateOfBirth = (values.dateOfBirth as dayjs.Dayjs).format(
      "YYYY-MM-DD"
    );
    try {
      if (editingPerson) {
        const name = PersonName.create({
          givenName: values.givenName,
          familyName: values.familyName,
        });
        const person = new Person(
          editingPerson.id,
          name,
          CalendarDate.fromString(dateOfBirth)
        );
        await useCase.updatePerson(person);
        message.success("Person updated");
      } else {
        const id = `p-${Date.now()}`;
        await useCase.createPerson({
          id,
          givenName: values.givenName,
          familyName: values.familyName,
          dateOfBirth,
        });
        if (household) {
          await useCase.addMemberToHousehold(household.id, `m-${id}`, id);
        }
        message.success("Person added");
      }
      setModalOpen(false);
      load();
    } catch (e) {
      message.error(String(e));
    }
  };

  const memberIds = household?.memberships.map((m) => m.personId) ?? [];
  const members = persons.filter((p) => memberIds.includes(p.id));

  return (
    <>
      <Card title="Household members" loading={loading}>
        <List
          dataSource={members}
          renderItem={(person) => (
            <List.Item
              actions={[
                <Button
                  key="edit"
                  type="link"
                  onClick={() => handleEditPerson(person)}
                >
                  Edit
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={person.displayName}
                description={`DOB: ${person.dateOfBirth.iso}`}
              />
            </List.Item>
          )}
        />
        <Button
          type="primary"
          onClick={handleAddPerson}
          style={{ marginTop: 8 }}
        >
          Add person
        </Button>
      </Card>
      <Modal
        title={editingPerson ? "Edit person" : "Add person"}
        open={modalOpen}
        onOk={() => handleSubmit()}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="givenName"
            label="First name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="familyName"
            label="Family name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="dateOfBirth"
            label="Date of birth"
            rules={[{ required: true }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
