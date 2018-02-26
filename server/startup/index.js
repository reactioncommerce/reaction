import Accounts from "./accounts";
import "./browser-policy";
import CollectionSecurity from "./collection-security";
import { importAllTranslations } from "./i18n";
import LoadFixtureData from "./load-data";
import Prerender from "./prerender";
import RateLimiters from "./rate-limits";
import RegisterCore from "./register-core";
import RegisterRouter from "./register-router";
import { initTemplates } from "/server/api/core/templates";
import { Reaction, Logger } from "/server/api";
import { Shops } from "/lib/collections";

export default function startup() {
  const startTime = Date.now();

  Accounts();
  initTemplates();
  RegisterCore();
  RegisterRouter();

  // initialize shop registry when a new shop is added
  Shops.find().observe({
    added(doc) {
      Reaction.setShopName(doc);
      Reaction.setDomain();
    },
    removed() {
      // TODO SHOP REMOVAL CLEANUP FOR #357
    }
  });

  LoadFixtureData();
  Reaction.init();

  importAllTranslations();

  Prerender();
  CollectionSecurity();
  RateLimiters();

  const endTime = Date.now();
  Logger.info(`Reaction initialization finished: ${endTime - startTime}ms`);
}
