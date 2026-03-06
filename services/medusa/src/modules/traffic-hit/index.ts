import { Module } from "@medusajs/framework/utils";
import TrafficHitModuleService from "./service";

export const TRAFFIC_HIT_MODULE = "traffic_hit";

export default Module(TRAFFIC_HIT_MODULE, {
  service: TrafficHitModuleService,
});
