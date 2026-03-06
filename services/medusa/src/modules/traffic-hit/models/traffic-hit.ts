import { model } from "@medusajs/framework/utils";

const TrafficHit = model.define("traffic_hit", {
  id: model.id().primaryKey(),
  path: model.text().searchable(),
  locale: model.text().nullable(),
  referrer_domain: model.text().nullable(),
  device_category: model.text().nullable(),
  country_code: model.text().nullable(),
  source: model.text().default("storefront"),
});

export default TrafficHit;
