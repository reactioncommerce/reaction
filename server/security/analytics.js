import { AnalyticsEvents } from "/lib/collections";
import { Reaction } from "/server/api";

export default function () {
  AnalyticsEvents.permit(["insert"]).ifHasRole({
    role: ["guest", "anonymous"],
    group: Reaction.getShopId()
  }).allowInClientCode();

  AnalyticsEvents.permit(["update", "remove"]).ifHasRole({
    role: ["admin", "owner"],
    group: Reaction.getShopId()
  }).allowInClientCode();
}
