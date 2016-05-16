import Core from "./core";
import * as AssignRoles from "./assignRoles";
import Import from "./import";
import * as LoadSettings from "./loadSettings";
import * as SetDomain from "./setDomain";
import * as ShopName from "./shopName";
import * as UI from "./ui";

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
  UI
);

export default Reaction;
