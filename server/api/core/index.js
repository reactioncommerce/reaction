import Core from "./core";
import * as Accounts from "./accounts";
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
  Collections,
  Endpoints,
  ...Importer,
  ...LoadSettings,
  Schemas,
  ...SetDomain,
  ...ShopName,
  ...Utils
};
