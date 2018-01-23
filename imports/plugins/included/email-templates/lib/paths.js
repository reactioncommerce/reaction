// Tempalte paths relative to /private/email/templates
// Templates registered in /imports/plugins/included/email-templates/server/index.js

/*
 * Default email templates
 * Used when no other template is found
 */
export const coreDefaultTemplate = "coreDefault";


/*
 * Account related email templates
 */
export const inviteNewShopMemberTemplate = "accounts/inviteNewShopMember";
export const inviteShopMemberTemplate = "accounts/inviteShopMember";
export const inviteShopOwnerTemplate = "accounts/inviteShopOwner";
export const resetPaswordTemplate = "accounts/resetPassword";
export const welcomeEmailTemplate = "accounts/sendWelcomeEmail";
export const verifyUpdatedEmailTemplate = "accounts/verifyUpdatedEmail";
// TODO: Used by launchdock, I haven't been able to test efficiently
export const verifyEmailTemplate = "accounts/verifyEmail";


/*
 * Order (coreOrder) related email templates
 */
export const coreOrderNewTemplate = "orders/new";
export const orderShipped = "orders/shipped";
export const orderRefunded = "orders/refunded";
export const orderItemRefund = "orders/itemRefund";
