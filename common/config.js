/**
 * Misc. App. Configuration
 *
 * A place to put misc. package configurations
 */
// client configuration
if (Meteor.isClient) {
  // override/set layout
  DEFAULT_LAYOUT = "coreLayout";
  // override/set workflow
  DEFAULT_WORKFLOW = "coreWorkflow";

  // Use this to override just the home Package
  // ie: {template: "products"}
  INDEX_OPTIONS = {};

  // default load qty for product grid
  ITEMS_INCREMENT = 12;
  // sets default number of product displayed on a grid
  Session.setDefault("productScrollLimit", ITEMS_INCREMENT);
}
