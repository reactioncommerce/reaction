import { AnalyticsEvents, Orders } from "/lib/collections";

Orders.before.insert((userId, order) => {
  const analyticsEvent = {
    eventType: "buy",
    value: order._id,
    label: "bought products"
  };
  AnalyticsEvents.insert(analyticsEvent);
});
