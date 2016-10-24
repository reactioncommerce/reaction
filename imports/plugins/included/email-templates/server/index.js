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
Reaction.registerTemplate({
  title: "Reset Password",
  name: TemplatePaths.resetPaswordTemplate,
  type: "email",
  template: Reaction.Email.getTemplateFile(TemplatePaths.resetPaswordTemplate)
});

Reaction.registerTemplate({
  title: "Invite Shop Member",
  name: TemplatePaths.inviteShopMemberTemplate,
  type: "email",
  template: Reaction.Email.getTemplateFile(TemplatePaths.inviteShopMemberTemplate)
});

Reaction.registerTemplate({
  title: "Welcome Email",
  name: TemplatePaths.welcomeEmailTemplate,
  type: "email",
  template: Reaction.Email.getTemplateFile(TemplatePaths.welcomeEmailTemplate)
});

Reaction.registerTemplate({
  title: "Verify Account",
  name: TemplatePaths.verifyEmailTemplate,
  type: "email",
  template: Reaction.Email.getTemplateFile(TemplatePaths.verifyEmailTemplate)
});

// Checkout
Reaction.registerTemplate({
  title: "Checkout Login",
  name: TemplatePaths.checkoutLoginTemplate,
  type: "email",
  template: Reaction.Email.getTemplateFile(TemplatePaths.checkoutLoginTemplate)
});

// Order workflow
Reaction.registerTemplate({
  title: "Order Completed",
  name: TemplatePaths.coreOrderCompletedTemplate,
  type: "email",
  template: Reaction.Email.getTemplateFile(TemplatePaths.coreOrderCompletedTemplate)
});

Reaction.registerTemplate({
  title: "Order Created",
  name: TemplatePaths.coreOrderCreatedTemplate,
  type: "email",
  template: Reaction.Email.getTemplateFile(TemplatePaths.coreOrderCreatedTemplate)
});

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
