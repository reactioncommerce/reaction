import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Products } from "/lib/collections";
import { Reaction } from "/server/api";

Meteor.publish("ProductAutocomplete", (searchTerm) => {
  check(searchTerm, Match.Optional(String));
  const shopId = Reaction.getShopId();
  let productAutoComplete;
  if (!searchTerm) {
    productAutoComplete = Products.find({
      shopId: shopId
    }, {
      title: 1
    });
  } else {
    productAutoComplete = Products.find({
      shopId: shopId,
      title: {
        $regex: searchTerm + ".*",
        $options: "i"
      }
    }, {
      title: 1
    });
  }
  return productAutoComplete;
});
