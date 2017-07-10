import { Factory } from "meteor/dburles:factory";
import { Groups } from "/lib/collections";
import { getShop } from "./shops";

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
