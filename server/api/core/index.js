import Core from "./core";
import * as AssignRoles from "./assignRoles";
import Import from "./import";
import * as LoadSettings from "./loadSettings";
import * as SetDomain from "./setDomain";
import * as ShopName from "./shopName";
import * as UI from "./ui";
import * as Utils from "./utils";

/**
 * Reaction methods (server)
 */
const Reaction = Object.assign(
  Core,
  AssignRoles,
  { Import },
  LoadSettings,
  SetDomain,
  ShopName,
  UI,
  Utils
);

export default Reaction;
