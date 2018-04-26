import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import buildMeteorContext from "/imports/plugins/graphql/server/buildMeteorContext";
import publishProductsMutation from "../mutations/publishProducts";

Meteor.methods({
  "catalog/publish/products": (productIds) => {
    check(productIds, [String]);
    const context = buildMeteorContext(this.userId);
    return publishProductsMutation(context, productIds);
  }
});
