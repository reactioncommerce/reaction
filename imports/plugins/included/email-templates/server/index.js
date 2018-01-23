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
 * Accounts - Invite Shop member with an Existing User Account
 * When: Admin invites new member to shop
 */
Reaction.registerTemplate({
  title: "Accounts - Invite Shop Member - Existing User Account",
  name: TemplatePaths.inviteShopMemberTemplate,
  type: "email",
  template: Reaction.Email.getTemplateFile(TemplatePaths.inviteShopMemberTemplate),
  subject: "You have been invited to join the group \"{{groupName}}\" in the store \"{{shop.name}}\""
});

/*
 * Accounts - Invite Shop member and create new user account
 * When: Admin invites new member to shop
 */
Reaction.registerTemplate({
  title: "Accounts - Invite Shop Member - New User Account",
  name: TemplatePaths.inviteNewShopMemberTemplate,
  type: "email",
  template: Reaction.Email.getTemplateFile(TemplatePaths.inviteNewShopMemberTemplate),
  subject: "You have been invited to join the group \"{{groupName}}\" in the store \"{{shop.name}}\""
});

/*
 * Accounts - Invite Shop Owner
 * When: A new shop is created. This is sent to the new shop owner
 */
Reaction.registerTemplate({
  title: "Accounts - Invite Shop Owner",
  name: TemplatePaths.inviteShopOwnerTemplate,
  type: "email",
  template: Reaction.Email.getTemplateFile(TemplatePaths.inviteShopOwnerTemplate),
  subject: "{{shop.name}} has invited you to manage a store"
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
  title: "Accounts - Verify Account (via LaunchDock)",
  name: TemplatePaths.verifyEmailTemplate,
  type: "email",
  template: Reaction.Email.getTemplateFile(TemplatePaths.verifyEmailTemplate),
  subject: "{{shopName}}: Please verify your email address"
});

/*
 * Accounts - Verify Updated Email
 * When: A user signs up through launchdock
 * TODO: Used by launchdock, I haven't been able to test efficiently
 */
Reaction.registerTemplate({
  title: "Accounts - Verify Updated Email Address",
  name: TemplatePaths.verifyUpdatedEmailTemplate,
  type: "email",
  template: Reaction.Email.getTemplateFile(TemplatePaths.verifyUpdatedEmailTemplate),
  subject: "Verify your new email address"
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
  * Orders - Order Refunded
  * When: Admin completes the order flow and item is shipped
  * When: Admin refunds line items
  */
Reaction.registerTemplate({
  title: "Orders - Order Item Refunded",
  name: TemplatePaths.orderItemRefund,
  type: "email",
  template: Reaction.Email.getTemplateFile(TemplatePaths.orderItemRefund),
  subject: "{{shop.name}}: Refund confirmation - {{order._id}}"
});
