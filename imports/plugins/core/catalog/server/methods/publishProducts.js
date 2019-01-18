import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import getGraphQLContextInMeteorMethod from "/imports/plugins/core/graphql/server/getGraphQLContextInMeteorMethod";
import publishProductsMutation from "../no-meteor/mutations/publishProducts";
import publishAllProducts from "../no-meteor/mutations/publishAllProducts";

Meteor.methods({
  "catalog/publish/products"(productIds) {
    check(productIds, [String]);
    const context = Promise.await(getGraphQLContextInMeteorMethod(this.userId));
    return publishProductsMutation(context, productIds);
  },
  "catalog/publishAll/products"() {
    const context = Promise.await(getGraphQLContextInMeteorMethod(this.userId));
    return publishAllProducts(context);
  }
});
