import Core from "./core";
import * as AssignRoles from "./assignRoles";
import Import from "./import";
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
const Reaction = Object.assign(
  Core,
  AssignRoles,
  { Collections },
  { Import },
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
