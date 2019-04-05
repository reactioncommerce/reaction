import SimpleSchema from "simpl-schema";
import { SSR } from "meteor/meteorhacks:ssr";
import Reaction from "/imports/plugins/core/core/server/Reaction";

const inputSchema = new SimpleSchema({
  action: {
    type: String
  },
  from: {
    type: String
  },
  to: {
    type: String
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
 * @param {Object} input Data for email: To, From, Action and DataforEmail
 * @return {Undefined} no return
 */
export default async function sendOrderEmail(context, input) {
  inputSchema.validate(input);

  // Compile Email with SSR
  let subject;
  let tpl;
  const { action, from, to, dataForEmail } = input;

  if (action === "shipped") {
    tpl = "orders/shipped";
    subject = "orders/shipped/subject";
  } else if (action === "refunded") {
    tpl = "orders/refunded";
    subject = "orders/refunded/subject";
  } else if (action === "itemRefund") {
    tpl = "orders/itemRefund";
    subject = "orders/itemRefund/subject";
  } else {
    tpl = `orders/${dataForEmail.order.workflow.status}`;
    subject = `orders/${dataForEmail.order.workflow.status}/subject`;
  }

  SSR.compileTemplate(tpl, Reaction.Email.getTemplate(tpl));
  SSR.compileTemplate(subject, Reaction.Email.getSubject(tpl));

  Reaction.Email.send({
    to: to,
    from: from,
    subject: SSR.render(subject, dataForEmail),
    html: SSR.render(tpl, dataForEmail)
  });
}
