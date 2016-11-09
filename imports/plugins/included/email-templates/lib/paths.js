// Tempalte paths relative to private/email/templates
// Templates registered in /imports/plugins/included/email-templates/server/index.js

export const coreDefaultTemplate = "coreDefault";

// Account related templates
export const resetPaswordTemplate = "accounts/resetPassword";
export const inviteShopMemberTemplate = "accounts/inviteShopMember";
export const welcomeEmailTemplate = "accounts/sendWelcomeEmail";
export const verifyEmailTemplate = "accounts/verify_email";



export const checkoutLoginTemplate = "checkout/checkoutLogin";

export const coreOrderCompletedTemplate1 = "orders/completed";
export const coreOrderCompletedTemplate2 = "orders/coreOrderCompleted";
export const ordersCoreOrderWorkflowProcessing = "orders/coreOrderWorkflow/processing";
export const ordersCoreOrderWorkflowCompleted = "orders/coreOrderWorkflow/completed";

export const coreOrderCreatedTemplate = "orders/coreOrderCreated";
export const coreOrderShippingInvoiceTemplate = "orders/coreOrderShippingInvoice";
export const coreOrderShippingSummaryTemplate = "orders/coreOrderShippingSummary";
export const coreOrderShippingTrackingTemplate = "orders/coreOrderShippingTracking";

/*
 * Email sent when new order is created
 */
export const coreOrderNewTemplate = "orders/new";

/*
 * Email sent when order is shipped
 * Also sent when "resend shipping notification" is clicked
 */
export const orderShipped = "orders/shipped";
