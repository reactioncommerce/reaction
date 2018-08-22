import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import getGraphQLContextInMeteorMethod from "/imports/plugins/core/graphql/server/getGraphQLContextInMeteorMethod";
import publishProductsMutation from "../no-meteor/mutations/publishProducts";

Meteor.methods({
  "catalog/publish/products"(productIds) {
    check(productIds, [String]);
    const context = Promise.await(getGraphQLContextInMeteorMethod(this.userId, this.connection));
    return publishProductsMutation(context, productIds);
  }
});
