import { model } from "@medusajs/framework/utils";

const Lead = model.define("lead", {
  id: model.id().primaryKey(),
  name: model.text().searchable(),
  company: model.text().nullable(),
  email: model.text().searchable(),
  phone: model.text().nullable(),
  country: model.text().nullable(),
  product: model.text().nullable(),
  quantity: model.text().nullable(),
  message: model.text().nullable(),
  consent: model.boolean().default(false),
  ip: model.text().nullable(),
  user_agent: model.text().nullable(),
  status: model.text().default("new"),
  priority: model.text().default("normal"),
  assignee: model.text().nullable(),
  notes: model.text().nullable(),
  source: model.text().default("quote_form"),
});

export default Lead;
