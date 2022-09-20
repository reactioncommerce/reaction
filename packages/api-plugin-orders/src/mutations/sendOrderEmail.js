import SimpleSchema from "simpl-schema";

const inputSchema = new SimpleSchema({
  action: {
    type: String,
    optional: true
  },
  fromShop: {
    type: Object,
    blackbox: true
  },
  to: {
    type: String
  },
  language: {
    type: String,
    optional: true
  },
  dataForEmail: {
    type: Object,
    blackbox: true
  }
});

/**
 * @name sendOrderEmail
 * @summary A mutation that compiles and server-side renders the email template with order data, and sends the email
 * @param {Object} context GraphQL context
 * @param {Object} input Data for email: action, dataForEmail, fromShop, to
 * @returns {Undefined} no return
 */
export default async function sendOrderEmail(context, input) {
  inputSchema.validate(input);

  const { action, dataForEmail, fromShop, language, to } = input;

  // Compile email
  let templateName;

  if (action === "shipped") {
    templateName = "orders/shipped";
  } else if (action === "refunded") {
    templateName = "orders/refunded";
  } else if (action === "itemRefund") {
    templateName = "orders/itemRefund";
  } else {
    templateName = `orders/${dataForEmail.order.workflow.status}`;
  }

  await context.mutations.sendEmail(context, {
    data: dataForEmail,
    fromShop,
    templateName,
    language,
    to
  });
}
