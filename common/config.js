/**
 * Misc. App. Configuration
 *
 * A place to put misc. package configurations
 */
// client configuration
if (Meteor.isClient) {
  ITEMS_INCREMENT = 10;
  // sets default number of product displayed on a grid
  Session.setDefault("productScrollLimit", ITEMS_INCREMENT);
}
