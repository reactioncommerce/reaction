//
// Publish Counts for some collections
// See: https://atmospherejs.com/tmeasday/publish-counts
//

//
// shopCounts is used by routing to determine
// if there is more than one shop configured.
//
Meteor.publish("shopsCount", function () {
  Counts.publish(this, "shops-count", ReactionCore.Collections.Shops.find());
});
