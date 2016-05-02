import { AnalyticsEvents } from "/lib/collections";
import { Reaction } from "/server/api";

export default function () {
  AnalyticsEvents.allow({
    insert(userId, analyticsEvent) {
      if (Match.test(analyticsEvent, AnalyticsEvents.Schema)) {
        return true;
      }
      return false;
    },
    update(userId, analyticsEvent, fields, modifier) {
      if (modifier.$set && modifier.$set.shopId) {
        return false;
      }
      return true;
    },
    remove(userId, analyticsEvent) {
      if (analyticsEvent.shopId !== Reaction.getShopId()) {
        return false;
      }
      return true;
    }
  });
}
