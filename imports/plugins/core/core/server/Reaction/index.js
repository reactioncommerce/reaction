import Log from "@reactioncommerce/logger";
import Core from "./core";
import addRolesToGroups from "./addRolesToGroups";
import assignOwnerRoles from "./assignOwnerRoles";
import Email from "./Email";
import Endpoints from "./Endpoints";
import { Fixture, Importer } from "./importer";
import getRegistryDomain from "./getRegistryDomain";
import getSlug from "./getSlug";
import loadSettings from "./loadSettings";
import setDomain from "./setDomain";
import setShopName from "./setShopName";
import * as Collections from "/lib/collections";
import * as Schemas from "/lib/collections/schemas";

export default {
  ...Core,
  addRolesToGroups,
  assignOwnerRoles,
  Collections,
  Email,
  Endpoints,
  Fixture,
  getRegistryDomain,
  getSlug,
  Importer,
  loadSettings,
  Log,
  Router: {},
  Schemas,
  setDomain,
  setShopName
};
