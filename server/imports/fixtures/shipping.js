import { Reaction } from "/server/api";

/*
 * Fixture - we always want a record
 */
// Meteor.startup(function() {
//   var jsonFile;
//   jsonFile = Assets.getText("private/data/Shipping.json");
//   return Fixtures.loadData(Collections.Shipping, jsonFile);
// });
Meteor.startup(function () {
  Reaction.Import.process(Assets.getText("private/data/Shipping.json"), ["name"], Reaction.Import.shipping);
  Reaction.Import.flush();
});
