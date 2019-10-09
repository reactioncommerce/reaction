import coreDefaultTemplate from "./coreDefault.js";
import inviteNewShopMemberTemplate from "./accounts/inviteNewShopMember.js";
import inviteShopMemberTemplate from "./accounts/inviteShopMember.js";
import inviteShopOwnerTemplate from "./accounts/inviteShopOwner.js";
import resetPasswordTemplate from "./accounts/resetPassword.js";
import welcomeEmailTemplate from "./accounts/sendWelcomeEmail.js";
import verifyUpdatedEmailTemplate from "./accounts/verifyUpdatedEmail.js";
import verifyEmailTemplate from "./accounts/verifyEmail.js";
import coreOrderNewTemplate from "./orders/new.js";
import orderShippedTemplate from "./orders/shipped.js";
import orderRefundedTemplate from "./orders/refunded.js";
import orderItemRefundTemplate from "./orders/itemRefund.js";

export default [
  /*
   * Default email templates
   * Used when no other template is found
   */
  {
    language: "en",
    title: "Default",
    name: "coreDefault",
    template: coreDefaultTemplate,
    subject: "A message from {{shop.name}}"
  },

  /*
   * Account related email templates
   */

  /*
   * Accounts - Invite Shop member with an Existing User Account
   * When: Admin invites new member to shop
   */
  {
    language: "en",
    title: "Accounts - Invite Shop Member - Existing User Account",
    name: "accounts/inviteShopMember",
    template: inviteShopMemberTemplate,
    subject: "You have been invited to join the group \"{{groupName}}\" in the store \"{{shop.name}}\""
  },

  /*
   * Accounts - Invite Shop member and create new user account
   * When: Admin invites new member to shop
   */
  {
    language: "en",
    title: "Accounts - Invite Shop Member - New User Account",
    name: "accounts/inviteNewShopMember",
    template: inviteNewShopMemberTemplate,
    subject: "You have been invited to join the group \"{{groupName}}\" in the store \"{{shop.name}}\""
  },

  /*
   * Accounts - Invite Shop Owner
   * When: A new shop is created. This is sent to the new shop owner
   */
  {
    language: "en",
    title: "Accounts - Invite Shop Owner",
    name: "accounts/inviteShopOwner",
    template: inviteShopOwnerTemplate,
    subject: "{{shop.name}} has invited you to manage a store"
  },

  /*
   * Accounts - Reset Password
   * When: User requests to reset their password
   */
  {
    language: "en",
    title: "Accounts - Reset Password",
    name: "accounts/resetPassword",
    template: resetPasswordTemplate,
    subject: "{{shop.name}}: Here's your password reset link"
  },

  /*
   * Accounts - Welcome Email
   * When: New user signs up for an account
   */
  {
    language: "en",
    title: "Accounts - Welcome Email",
    name: "accounts/sendWelcomeEmail",
    template: welcomeEmailTemplate,
    subject: "You're In. Welcome to {{shop.name}}!"
  },

  /*
   * Accounts - Verify Email
   * When: A user signs up
   */
  {
    language: "en",
    title: "Accounts - Verify Account (via LaunchDock)",
    name: "accounts/verifyEmail",
    template: verifyEmailTemplate,
    subject: "{{shopName}}: Please verify your email address"
  },

  /*
   * Accounts - Verify Updated Email
   * When: A user changes their email
   */
  {
    language: "en",
    title: "Accounts - Verify Updated Email Address",
    name: "accounts/verifyUpdatedEmail",
    template: verifyUpdatedEmailTemplate,
    subject: "Verify your new email address"
  },

  /*
   * Order related email templates
   */

  /*
   * Orders - New Order Place
   * When: A user completes the cart checkout flow and a new order is placed
   */
  {
    language: "en",
    title: "Orders - New Order Placed",
    name: "orders/new",
    template: coreOrderNewTemplate,
    subject: "Your order is confirmed - {{order.referenceId}}"
  },

  /*
   * Orders - Order Shipped
   * When: Admin completes the order flow and item is shipped
   * When: Admin re-sends shipment notification
   */
  {
    language: "en",
    title: "Orders - Order Shipped",
    name: "orders/shipped",
    template: orderShippedTemplate,
    subject: "{{shop.name}}: Your order has shipped - {{order.referenceId}}"
  },

  /*
   * Orders - Order Refunded
   * When: Admin completes the order flow and item is shipped
   * When: Admin re-sends shipment notification
   */
  {
    language: "en",
    title: "Orders - Order Refunded",
    name: "orders/refunded",
    template: orderRefundedTemplate,
    subject: "{{shop.name}}: Confirmation of refund for {{order.referenceId}}"
  },

  /*
   * Orders - Order Refunded
   * When: Admin completes the order flow and item is shipped
   * When: Admin refunds line items
   */
  {
    language: "en",
    title: "Orders - Order Item Refunded",
    name: "orders/itemRefund",
    template: orderItemRefundTemplate,
    subject: "{{shop.name}}: Refund confirmation - {{order.referenceId}}"
  }
];
