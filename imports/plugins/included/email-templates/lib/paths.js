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





export const verifyEmailTemplate = "accounts/verify_email";


/*
 * Checkout related email templates
 */
export const checkoutLoginTemplate = "checkout/checkoutLogin";


/*
 * Order (coreOrder) related email templates
 */
export const orderShipped = "orders/shipped";



























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
