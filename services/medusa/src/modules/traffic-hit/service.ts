import { MedusaService } from "@medusajs/framework/utils";
import TrafficHit from "./models/traffic-hit";

class TrafficHitModuleService extends MedusaService({
  TrafficHit,
}) {}

export default TrafficHitModuleService;
