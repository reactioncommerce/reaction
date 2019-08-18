import { Factory } from "meteor/dburles:factory";
import { Groups } from "/lib/collections";
import { getShop } from "./shops";

/**
 * @summary define group factory
 * @returns {undefined}
 */
export default function () {
  const group = {
    name: "default",
    slug: "default",
    permissions: ["test"],
    shopId: getShop()._id,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  Factory.define("group", Groups, group);
}
