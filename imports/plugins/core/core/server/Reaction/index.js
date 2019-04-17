import Log from "@reactioncommerce/logger";
import getGraphQLContextInMeteorMethod from "/imports/plugins/core/graphql/server/getGraphQLContextInMeteorMethod";
import Core from "./core";
import addRolesToGroups from "./addRolesToGroups";
import assignOwnerRoles from "./assignOwnerRoles";
import Endpoints from "./Endpoints";
import { Fixture, Importer } from "./importer";
import getRegistryDomain from "./getRegistryDomain";
import getSlug from "./getSlug";
import loadSettings from "./loadSettings";
import setDomain from "./setDomain";
import setShopName from "./setShopName";
import * as Collections from "/lib/collections";
import * as Schemas from "/lib/collections/schemas";
import * as accountUtils from "./accountUtils";

export default {
  ...Core,
  ...accountUtils,
  addRolesToGroups,
  assignOwnerRoles,
  Collections,

  /**
   * @deprecated Reaction.Email should no longer be used
   */
  Email: {
    /**
     * @summary Backwards compatible email sending function
     * @deprecated Call `context.mutations.sendEmail` directly instead
     * @param {Object} options See `sendEmail`
     * @returns {undefined}
     */
    send(options) {
      const context = Promise.await(getGraphQLContextInMeteorMethod(accountUtils.getUserId()));

      if (!options.fromShopId) options.fromShopId = Core.getShopId();

      return Promise.await(context.mutations.sendEmail(context, options));
    }
  },

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
