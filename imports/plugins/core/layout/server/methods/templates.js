import { check } from "meteor/check";
import { Templates } from "/lib/collections";
import { Reaction } from "/server/api";

export function getTemplateByName(name, shopId) {
  check(name, String);

  const template = Templates.findOne({
    name,
    shopId: shopId || Reaction.getShopId()
  });

  return template;
}
