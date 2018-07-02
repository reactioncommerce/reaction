import { Security } from "meteor/ongoworks:security";
import { Discounts } from "../../lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";

//
// Security definitions
//
Security.permit(["read", "insert", "update", "remove"]).collections([
  Discounts
]).ifHasRole({
  role: "discounts",
  group: Reaction.getShopId()
});
