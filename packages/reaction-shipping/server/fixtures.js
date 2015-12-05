/*
 * Fixture - we always want a record
 */
// Meteor.startup(function() {
//   var jsonFile;
//   jsonFile = Assets.getText("private/data/Shipping.json");
//   return Fixtures.loadData(ReactionCore.Collections.Shipping, jsonFile);
// });
Meteor.startup(function () {
  ReactionImport.process(Assets.getText("private/data/Shipping.json"), ["name"], ReactionImport.shipping);
  ReactionImport.flush();
});
