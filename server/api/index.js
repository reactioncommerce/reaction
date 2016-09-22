import Reaction from "./core";
import * as Accounts from "./core/accounts";
import Router from "./router";
import { GeoCoder } from "./geocoder";
import Hooks from "./hooks";
import Logger from "./logger";
import { MethodHooks } from "./method-hooks";

// Legacy globals
// TODO: add deprecation warnings
ReactionCore = Reaction;
ReactionRouter = Router;
ReactionRegistry = {
  assignOwnerRoles: Reaction.assignOwnerRoles,
  createDefaultAdminUser: Reaction.createDefaultAdminUser,
  getRegistryDomain: Reaction.getRegistryDomain,
  loadPackages: Reaction.loadPackages,
  loadSettings: Reaction.loadSettings,
  Packages: Reaction.Packages,
  setDomain: Reaction.setDomain,
  setShopName: Reaction.setShopName
};

export {
  Reaction,
  Accounts,
  Router,
  GeoCoder,
  Hooks,
  Logger,
  MethodHooks
};
