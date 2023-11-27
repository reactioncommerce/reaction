export default {
  couponLog: (order, _, context) => context.queries.couponLogByOrderId(context, order.orderId)
};
