import Log from "@reactioncommerce/logger";
import Core from "./core";
import * as Accounts from "./accounts";
import * as AddDefaultRoles from "./addDefaultRoles";
import * as AssignRoles from "./assignRoles";
import Endpoints from "./endpoints";
import * as Importer from "./importer";
import * as LoadSettings from "./loadSettings";
import * as SetDomain from "./setDomain";
import * as ShopName from "./shopName";
import * as Utils from "./utils";

import * as Collections from "/lib/collections";
import * as Schemas from "/lib/collections/schemas";

/**
 * @namespace EventHooks
 */

export default {
  ...Core,
  Accounts,
  ...AddDefaultRoles,
  ...AssignRoles,
  Collections,
  Endpoints,
  ...Importer,
  ...LoadSettings,
  Log,
  Router: {},
  Schemas,
  ...SetDomain,
  ...ShopName,
  ...Utils
};
