test("should return access denied if user does not have access", async () => {
  // sandbox.stub(Reaction, "hasPermission", () => false);
  // spyOnMethod("capturePayments", order.userId);
  // function capturePayments() {
  //   return Meteor.call("orders/capturePayments", order._id);
  // }
  // expect(capturePayments).to.throw(ReactionError, /Access Denied/);
});

test("should update the order item workflow to coreOrderItemWorkflow/captured", async () => {
  // sandbox.stub(Reaction, "hasPermission", () => true);
  // spyOnMethod("capturePayments", order.userId);
  // Meteor.call("orders/capturePayments", order._id);
  // const orderItemWorkflow = Orders.findOne({ _id: order._id }).items[0].workflow;
  // expect(orderItemWorkflow.status).to.equal("coreOrderItemWorkflow/captured");
});

test("should update the order after the payment processor has captured the payment", async () => {
  // sandbox.stub(Reaction, "hasPermission", () => true);
  // spyOnMethod("capturePayments", order.userId);
  // Meteor.call("orders/capturePayments", order._id, () => {
  //   const orderPayment = shippingObjectMethod(Orders.findOne({ _id: order._id })).payment;
  //   expect(orderPayment.mode).to.equal("capture");
  //   expect(orderPayment.status).to.equal("completed");
  //   done();
  // });
});

test("should update order payment method status to error if payment processor fails", async () => {
  // sandbox.stub(Reaction, "hasPermission", () => true);
  // spyOnMethod("capturePayments", order.userId);
  // sandbox.stub(Meteor.server.method_handlers, "example/payment/capture", function (...args) {
  //   check(args, [Match.Any]);
  //   return {
  //     error: "stub error",
  //     saved: false
  //   };
  // });

  // sandbox.stub(Logger, "fatal"); // since we expect this, let's keep the output clean
  // Meteor.call("orders/capturePayments", order._id, () => {
  //   const orderPayment = shippingObjectMethod(Orders.findOne({ _id: order._id })).payment;
  //   expect(orderPayment.mode).to.equal("capture");
  //   expect(orderPayment.status).to.equal("error");
  //   done();
  // });
});
