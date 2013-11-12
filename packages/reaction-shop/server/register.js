Meteor.startup(function () {
  console.log("Adding Reaction Shop to packages");
  ReactionPackages.update({
    name: "reaction-shop",
    label: "Shop",
    description: "Reaction Shop",
    icon: "fa fa-shopping-cart fa-5x",
    route: "shop",
    template: "shopwelcome",
    priority: "3",
    metafields: {type: ''}
  }, {$set: {}}, {upsert: true});
});

Meteor.startup(function () {
  console.log("Adding Reaction Shop Orders to packages");
  ReactionPackages.update({
    name: "reaction-shop-orders",
    label: "Orders",
    route: "shop/orders",
    metafields: {type: 'reaction-shop', visible: 'nav'}
  }, {$set: {}}, {upsert: true});
});
