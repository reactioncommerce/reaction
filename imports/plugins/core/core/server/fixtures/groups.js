import { Factory } from "meteor/dburles:factory";
import { Groups } from "/lib/collections";
import { getShop } from "./shops";

/**
 * @name group
 * @memberof Fixtures
 * @summary Factory for user group with permissions and a shop
 * @example let group = Factory.create("group", { shopId: shop._id, slug: "customer" });
 * @property {String} name - `"default"`
 * @property {String} slug - `"default"`
 * @property {Array} permissions - `["test"]`
 * @property {String} shopID - `getShop()._id`
 * @property {Date} createdAt - `new Date()`
 * @property {Date} updatedAt - `new Date()`
 */
const group = {
  name: "default",
  slug: "default",
  permissions: ["test"],
  shopId: getShop()._id,
  createdAt: new Date(),
  updatedAt: new Date()
};

export default function () {
  Factory.define("group", Groups, group);
}
