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
export const inviteShopMemberTemplate = "accounts/inviteShopMember";
export const resetPaswordTemplate = "accounts/resetPassword";
export const welcomeEmailTemplate = "accounts/sendWelcomeEmail";
// TODO: Used by launchdock, and I haven't been able to test efficiently
export const verifyEmailTemplate = "accounts/verify_email";


/*
 * Order (coreOrder) related email templates
 */
export const coreOrderNewTemplate = "orders/new";
export const orderShipped = "orders/shipped";
export const orderRefunded = "orders/refunded";


/*
 * Checkout related email templates
 */
// export const checkoutLoginTemplate = "checkout/checkoutLogin";











//
// export const ordersCoreOrderWorkflowProcessing = "orders/coreOrderWorkflow/processing";
// export const ordersCoreOrderWorkflowCompleted = "orders/coreOrderWorkflow/completed";
// export const coreOrderCreatedTemplate = "orders/coreOrderCreated";
// export const coreOrderShippingInvoiceTemplate = "orders/coreOrderShippingInvoice";
// export const coreOrderShippingSummaryTemplate = "orders/coreOrderShippingSummary";
// export const coreOrderShippingTrackingTemplate = "orders/coreOrderShippingTracking";

/*
 * Email sent when new order is created
 */










/*
 * TODO
 * Emails that are never sent out.
 * Should we keep these for legacy users who might be using them? Should we delete these?
 */
// Accounts



/*
 * TODO
 * Emails that are no longer used by this version of Reaction
 * Should we keep these for legacy users who might be using them? Or delete?
 */
// This is no longer used, as we use "orders/shipped" to send the email
// export const coreOrderCompletedTemplate2 = "orders/coreOrderCompleted";
