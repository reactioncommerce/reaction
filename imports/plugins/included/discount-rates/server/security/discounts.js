import { Security } from "meteor/ongoworks:security";
import { Discounts } from "/imports/plugins/core/discounts/lib/collections";
import Reaction from "/server/api/core";

//
// Security definitions
//
Security.permit(["read", "insert", "update", "remove"]).collections([
  Discounts
]).ifHasRole({
  role: "discount-rates",
  group: Reaction.getShopId()
});
