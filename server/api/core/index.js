import Core from "./core";
import * as assignRoles from "./assignRoles";
import * as defaultAdmin from "./defaultAdmin";
import * as loadPackages from "./loadPackages";
import * as loadSettings from "./loadSettings";
import * as setDomain from "./setDomain";
import * as shopName from "./shopName";
import * as ui from "./ui";

/**
 * Reaction methods (server)
 */
const Reaction = Object.assign(
  Core,
  assignRoles,
  defaultAdmin,
  loadPackages,
  loadSettings,
  setDomain,
  shopName,
  ui
);

export default Reaction;
