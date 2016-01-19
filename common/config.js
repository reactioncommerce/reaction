/**
 * Misc. App. Configuration
 *
 * A place to put misc. package configurations
 */
// TODO: remove this if utility:avatar is not needed to you
// Avatar.setOptions({
//  defaultImageUrl: "https://raw.githubusercontent.com/reactioncommerce/reaction/development/public/resources/avatar.gif",
//  fallbackType: "image",
//  cssClassPrefix: "reactionAvatar"
// });
// client configuration
if (Meteor.isClient) {
  ITEMS_INCREMENT = 10;
  // sets default number of product displayed on a grid
  Session.setDefault("productScrollLimit", ITEMS_INCREMENT);
}
