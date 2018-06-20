import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import buildMeteorContext from "/imports/plugins/core/graphql/server/buildMeteorContext";
import publishProductsMutation from "../no-meteor/mutations/publishProducts";

Meteor.methods({
  "catalog/publish/products"(productIds) {
    check(productIds, [String]);
    const context = Promise.await(buildMeteorContext(this.userId));
    return publishProductsMutation(context, productIds);
  }
});
