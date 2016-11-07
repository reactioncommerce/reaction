import { Reaction } from "/server/api";
import * as TemplatePaths from "../lib/paths.js";

// Default
Reaction.registerTemplate({
  title: "Default",
  name: TemplatePaths.coreDefaultTemplate,
  type: "email",
  template: Reaction.Email.getTemplateFile(TemplatePaths.coreDefaultTemplate)
});

// Accounts

// Reset Password
Reaction.registerTemplate({
  title: "Reset Password",
  name: TemplatePaths.resetPaswordTemplate,
  type: "email",
  template: Reaction.Email.getTemplateFile(TemplatePaths.resetPaswordTemplate)
});

// Invite new shop member
Reaction.registerTemplate({
  title: "Invite Shop Member",
  name: TemplatePaths.inviteShopMemberTemplate,
  type: "email",
  template: Reaction.Email.getTemplateFile(TemplatePaths.inviteShopMemberTemplate)
});

// Welcome email for new account
Reaction.registerTemplate({
  title: "Welcome Email",
  name: TemplatePaths.welcomeEmailTemplate,
  type: "email",
  template: Reaction.Email.getTemplateFile(TemplatePaths.welcomeEmailTemplate)
});

// Account verification email
Reaction.registerTemplate({
  title: "Verify Account",
  name: TemplatePaths.verifyEmailTemplate,
  type: "email",
  template: Reaction.Email.getTemplateFile(TemplatePaths.verifyEmailTemplate)
});

// Checkout

// checkout login
Reaction.registerTemplate({
  title: "Checkout Login",
  name: TemplatePaths.checkoutLoginTemplate,
  type: "email",
  template: Reaction.Email.getTemplateFile(TemplatePaths.checkoutLoginTemplate)
});

// Order workflow

// Order workflow completed - old version
Reaction.registerTemplate({
  title: "Order Completed 1",
  name: TemplatePaths.coreOrderCompletedTemplate1,
  type: "email",
  template: Reaction.Email.getTemplateFile(TemplatePaths.coreOrderCompletedTemplate1)
});

// Order workflow completed - old version #2
Reaction.registerTemplate({
  title: "Order Completed 2",
  name: TemplatePaths.coreOrderCompletedTemplate2,
  type: "email",
  template: Reaction.Email.getTemplateFile(TemplatePaths.coreOrderCompletedTemplate2)
});

// Order workflow completed
Reaction.registerTemplate({
  title: "Order Completed New",
  name: TemplatePaths.ordersCoreOrderWorkflowCompleted,
  type: "email",
  template: Reaction.Email.getTemplateFile(TemplatePaths.ordersCoreOrderWorkflowCompleted)
});

// Order workflow processing
Reaction.registerTemplate({
  title: "Order Processing New",
  name: TemplatePaths.ordersCoreOrderWorkflowProcessing,
  type: "email",
  template: Reaction.Email.getTemplateFile(TemplatePaths.ordersCoreOrderWorkflowProcessing)
});

// Order workflow new order created
Reaction.registerTemplate({
  title: "Order Created",
  name: TemplatePaths.coreOrderCreatedTemplate,
  type: "email",
  template: Reaction.Email.getTemplateFile(TemplatePaths.coreOrderCreatedTemplate)
});







// Still working through

Reaction.registerTemplate({
  title: "Shipping Invoice",
  name: TemplatePaths.coreOrderShippingInvoiceTemplate,
  type: "email",
  template: Reaction.Email.getTemplateFile(TemplatePaths.coreOrderShippingInvoiceTemplate)
});

Reaction.registerTemplate({
  title: "Shipping Summary",
  name: TemplatePaths.coreOrderShippingSummaryTemplate,
  type: "email",
  template: Reaction.Email.getTemplateFile(TemplatePaths.coreOrderShippingSummaryTemplate)
});

Reaction.registerTemplate({
  title: "Shipping Tracking",
  name: TemplatePaths.coreOrderShippingTrackingTemplate,
  type: "email",
  template: Reaction.Email.getTemplateFile(TemplatePaths.coreOrderShippingTrackingTemplate)
});

Reaction.registerTemplate({
  title: "New Order Started Processing",
  name: TemplatePaths.coreOrderNewTemplate,
  type: "email",
  template: Reaction.Email.getTemplateFile(TemplatePaths.coreOrderNewTemplate)
});
