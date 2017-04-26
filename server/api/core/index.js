import Core from "./core";
import * as Accounts from "./accounts";
import * as AddDefaultRoles from "./addDefaultRoles";
import * as AssignRoles from "./assignRoles";
import * as Email from "./email";
import * as Import from "./import";
import * as LoadSettings from "./loadSettings";
import Log from "../logger";
import Router from "../router";
import * as SetDomain from "./setDomain";
import * as ShopName from "./shopName";
import * as UI from "./ui";
import * as Utils from "./utils";

import * as Collections from "/lib/collections";
import * as Schemas from "/lib/collections/schemas";

/**
 * Reaction methods (server)
 */
const Reaction = Object.assign({},
  Core,
  { Accounts },
  AddDefaultRoles,
  AssignRoles,
  { Collections },
  { Email },
  Import,
  LoadSettings,
  { Log },
  { Router },
  { Schemas },
  SetDomain,
  ShopName,
  UI,
  Utils
);

export default Reaction;
