import Hooks from "@reactioncommerce/hooks";
import { Security } from "meteor/ongoworks:security";
import { Roles } from "meteor/alanning:roles";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import * as Collections from "../lib/collections";


const {
  JobFileRecords,
  JobItems,
  Mappings
} = Collections;

/**
 * @summary Adds security rule to plugin collections
 * @method
 * @return {Undefined} undefined
 */
export default function () {
  Security.permit(["insert", "update", "remove"])
    .collections([JobFileRecords, JobItems, Mappings])
    .ifHasRoleForActiveShop({ role: ["admin", "owner", "createProduct"] });
  Hooks.Events.run("afterSecurityInit");
}
