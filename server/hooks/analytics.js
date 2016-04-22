ReactionCore.Collections.Orders.before.insert((userId, order) => {
  const analyticsEvent = {
    eventType: "buy",
    value: order._id,
    label: "bought products"
  };
  ReactionCore.Collections.AnalyticsEvents.insert(analyticsEvent);
});
