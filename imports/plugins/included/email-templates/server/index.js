import { Reaction } from "/server/api";
import * as TemplatePaths from "../lib/paths.js";

/*
 * Default email templates
 * Used when no other template is found
 */
Reaction.registerTemplate({
  title: "Default",
  name: TemplatePaths.coreDefaultTemplate,
  type: "email",
  template: Reaction.Email.getTemplateFile(TemplatePaths.coreDefaultTemplate),
  subject: "A message from {{shop.name}}"
});


/*
 * Account related email templates
 */

/*
 * Accounts - Invite Shop member
 * When: Admin invites new member to shop
 */
Reaction.registerTemplate({
  title: "Accounts - Invite Shop Member",
  name: TemplatePaths.inviteShopMemberTemplate,
  type: "email",
  template: Reaction.Email.getTemplateFile(TemplatePaths.inviteShopMemberTemplate),
  subject: "You have been invited to join {{shop.name}}"
});

/*
 * Accounts - Reset Password
 * When: User requests to reset their password
 */
Reaction.registerTemplate({
  title: "Accounts - Reset Password",
  name: TemplatePaths.resetPaswordTemplate,
  type: "email",
  template: Reaction.Email.getTemplateFile(TemplatePaths.resetPaswordTemplate),
  subject: "{{shop.name}}: Here's your password reset link"
});

/*
 * Accounts - Welcome Email
 * When: New user signs up for an account
 */
Reaction.registerTemplate({
  title: "Accounts - Welcome Email",
  name: TemplatePaths.welcomeEmailTemplate,
  type: "email",
  template: Reaction.Email.getTemplateFile(TemplatePaths.welcomeEmailTemplate),
  subject: "You're In. Welcome to {{shop.name}}!"
});

/*
 * Accounts - Verify Email
 * When: A user signs up through launchdock
 * TODO: Used by launchdock, I haven't been able to test efficiently
 */
 Reaction.registerTemplate({
   title: "Verify Account",
   name: TemplatePaths.verifyEmailTemplate,
   type: "email",
   template: Reaction.Email.getTemplateFile(TemplatePaths.verifyEmailTemplate),
   subject: "This is the subject"
 });


/*
 * Order (coreOrder) related email templates
 */

/*
 * Orders - New Order Place
 * When: A user completes the cart checkout flow and a new order is placed
 */
Reaction.registerTemplate({
  title: "Orders - New Order Placed",
  name: TemplatePaths.coreOrderNewTemplate,
  type: "email",
  template: Reaction.Email.getTemplateFile(TemplatePaths.coreOrderNewTemplate),
  subject: "Your order is confirmed - {{order._id}}"
});

/*
 * Orders - Order Shipped
 * When: Admin completes the order flow and item is shipped
 * When: Admin resends shipment notification
 */
Reaction.registerTemplate({
  title: "Orders - Order Shipped",
  name: TemplatePaths.orderShipped,
  type: "email",
  template: Reaction.Email.getTemplateFile(TemplatePaths.orderShipped),
  subject: "{{shop.name}}: Your order has shipped - {{order._id}}"
});

/*
 * Orders - Order Refunded
 * When: Admin completes the order flow and item is shipped
 * When: Admin resends shipment notification
 */
Reaction.registerTemplate({
  title: "Orders - Order Refunded",
  name: TemplatePaths.orderRefunded,
  type: "email",
  template: Reaction.Email.getTemplateFile(TemplatePaths.orderRefunded),
  subject: "{{shop.name}}: Confirmation of refund for {{order._id}}"
});





























/*
 * Checkout related email templates
 */

// // checkout login
// Reaction.registerTemplate({
//   title: "Checkout Login",
//   name: TemplatePaths.checkoutLoginTemplate,
//   type: "email",
//   template: Reaction.Email.getTemplateFile(TemplatePaths.checkoutLoginTemplate),
//   subject: "This is the subject"
// });


/*
 * Order (coreOrder) related email templates
 */


//
//
//
// // Order workflow completed
// Reaction.registerTemplate({
//   title: "Order Completed New",
//   name: TemplatePaths.ordersCoreOrderWorkflowCompleted,
//   type: "email",
//   template: Reaction.Email.getTemplateFile(TemplatePaths.ordersCoreOrderWorkflowCompleted),
//   subject: "This is the subject"
// });
//
// // Order workflow processing
// Reaction.registerTemplate({
//   title: "Order Processing New",
//   name: TemplatePaths.ordersCoreOrderWorkflowProcessing,
//   type: "email",
//   template: Reaction.Email.getTemplateFile(TemplatePaths.ordersCoreOrderWorkflowProcessing),
//   subject: "This is the subject"
// });
//
// // Order workflow new order created
// Reaction.registerTemplate({
//   title: "Order Created",
//   name: TemplatePaths.coreOrderCreatedTemplate,
//   type: "email",
//   template: Reaction.Email.getTemplateFile(TemplatePaths.coreOrderCreatedTemplate),
//   subject: "{{shop.name}}: Your order has shipped - {{order._id}}"
// });
//
//
// // Still working through
//
// Reaction.registerTemplate({
//   title: "Shipping Invoice",
//   name: TemplatePaths.coreOrderShippingInvoiceTemplate,
//   type: "email",
//   template: Reaction.Email.getTemplateFile(TemplatePaths.coreOrderShippingInvoiceTemplate),
//   subject: "This is the subject"
// });
//
// Reaction.registerTemplate({
//   title: "Shipping Summary",
//   name: TemplatePaths.coreOrderShippingSummaryTemplate,
//   type: "email",
//   template: Reaction.Email.getTemplateFile(TemplatePaths.coreOrderShippingSummaryTemplate),
//   subject: "This is the subject"
// });
//
// Reaction.registerTemplate({
//   title: "Shipping Tracking",
//   name: TemplatePaths.coreOrderShippingTrackingTemplate,
//   type: "email",
//   template: Reaction.Email.getTemplateFile(TemplatePaths.coreOrderShippingTrackingTemplate),
//   subject: "This is the subject"
// });
//
//
//
//
//
//
//
//
//
//
// /*
//  * TODO
//  * Emails that are never sent out.
//  * Should we keep these for legacy users who might be using them? Should we delete these?
//  */
// TODO: Unused always?????
// Accounts
// Account verification email

//
//
// /*
//  * TODO
//  * Emails that are no longer used by this version of Reaction
//  * Should we keep these for legacy users who might be using them? Or delete?
//  */
//
//
//
// // This is no longer used, as we use "orders/shipped" to send the email
// // Order workflow completed - old version #2
// Reaction.registerTemplate({
//   title: "Order Completed 2",
//   name: TemplatePaths.coreOrderCompletedTemplate2,
//   type: "email",
//   template: Reaction.Email.getTemplateFile(TemplatePaths.coreOrderCompletedTemplate2),
//   subject: "This is the subject"
// });
