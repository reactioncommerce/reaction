import Log from "@reactioncommerce/logger";
import Core from "./core";
import { Fixture, Importer } from "./importer";
import getSlug from "./getSlug";
import loadSettings from "./loadSettings";
import * as Collections from "/lib/collections";
import * as Schemas from "/lib/collections/schemas";
import * as accountUtils from "./accountUtils";

export default {
  ...Core,
  ...accountUtils,
  Collections,
  Fixture,
  getSlug,
  Importer,
  loadSettings,
  Log,
  Router: {},
  Schemas
};
