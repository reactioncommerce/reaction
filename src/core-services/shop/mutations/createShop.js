import SimpleSchema from "simpl-schema";
import getSlug from "@reactioncommerce/api-utils/getSlug.js";
import Logger from "@reactioncommerce/logger";
import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";

const inputSchema = new SimpleSchema({
  currencyCode: {
    type: String,
    optional: true
  },
  defaultLanguage: {
    type: String,
    optional: true
  },
  defaultTimezone: {
    type: String,
    optional: true
  },
  name: String,
  // Historically, the allowed types were primary, merchant, and affiliate.
  // Until we have solid future direction for multi-shop support, we'll
  // allow any string here.
  type: {
    type: String,
    optional: true
  }
});

/**
 * @summary Create one Packages collection doc for each plugin, for this shop
 * @param {Object} context App context
 * @param {String} shopId Shop ID
 * @return {undefined}
 */
async function createPackagesForShop(context, shopId) {
  const { app, collections: { Packages } } = context;

  // Create Packages docs for each plugin for this shop
  /* eslint-disable no-await-in-loop */
  for (const config of Object.values(app.registeredPlugins)) {
    const packageDoc = {
      // autoEnable no longer does anything. All are enabled by default.
      enabled: true,
      icon: config.icon,
      name: config.name,
      registry: config.registry,
      version: config.version,
      shopId
    };

    await Packages.updateOne({
      name: config.name,
      shopId
    }, {
      $set: packageDoc,
      $setOnInsert: {
        _id: Random.id()
      }
    }, {
      upsert: true
    });
  }
}

/**
 * @name shop/createShop
 * @memberof Mutations/Shop
 * @method
 * @summary Creates a new shop
 * @param {Object} context - App context
 * @param {Object} input - an object of all mutation arguments that were sent
 * @param {String} [input.currencyCode] Currency in which all money values should be assumed to be. Default "USD"
 * @param {String} [input.defaultLanguage] Default language for translation and localization. Default "en"
 * @param {String} [input.defaultTimezone] Primary timezone. Default "US/Pacific"
 * @param {String} input.name A unique name for the shop
 * @param {String} [input.type] The shop type. Default is "primary", but there may be only one primary shop.
 * @returns {Promise<Object>} with updated shop
 */
export default async function createShop(context, input) {
  inputSchema.validate(input || {});

  const {
    accountId,
    appEvents,
    checkPermissionsLegacy,
    collections,
    rootUrl,
    simpleSchemas: {
      Shop: ShopSchema
    },
    userId
  } = context;

  await checkPermissionsLegacy(["owner", "shop/create"]);
  // TODO: pod-auth - what do we do here? if this is the first shop, then there isn't a shop at this time,
  // so what permissions do we need to check for?

  const { currencyCode, defaultLanguage, defaultTimezone, name, type } = input;

  const domain = rootUrl && new URL(rootUrl).hostname;
  const now = new Date();
  const shop = {
    _id: Random.id(),
    active: true,
    availablePaymentMethods: [],
    baseUOL: "in",
    baseUOM: "oz",
    createdAt: now,
    currency: currencyCode || "USD",
    domains: [domain],
    language: defaultLanguage || "en",
    name,
    paymentMethods: [],
    shopType: type || "primary",
    slug: getSlug(name),
    timezone: defaultTimezone || "US/Pacific",
    unitsOfLength: [{
      uol: "in",
      label: "Inches",
      default: true
    }, {
      uol: "cm",
      label: "Centimeters"
    }, {
      uol: "ft",
      label: "Feet"
    }],
    unitsOfMeasure: [{
      uom: "oz",
      label: "Ounces",
      default: true
    }, {
      uom: "lb",
      label: "Pounds"
    }, {
      uom: "g",
      label: "Grams"
    }, {
      uom: "kg",
      label: "Kilograms"
    }],
    updatedAt: now
  };

  ShopSchema.validate(shop);

  // Ensure we never have more than one primary shop
  if (shop.shopType === "primary") {
    const existingPrimaryShop = await collections.Shops.findOne({ shopType: "primary" }, { projection: { _id: 1 } });
    if (existingPrimaryShop) {
      throw new ReactionError("invalid-param", "There may be only one primary shop");
    }
  }

  const { result } = await collections.Shops.insertOne(shop);
  if (result.ok !== 1) {
    throw new ReactionError("server-error", "Unable to create shop");
  }

  const newShopId = shop._id;

  try {
    await createPackagesForShop(context, newShopId);

    // Create account groups for the new shop
    await context.mutations.createAuthGroupsForShop(context, newShopId);

    // Give the shop creator "owner" permissions
    await context.mutations.addAccountToGroupBySlug(context, { accountId, groupSlug: "owner", shopId: newShopId });
  } catch (error) {
    Logger.error(error, "Error after creating shop");
  }

  await appEvents.emit("afterShopCreate", { createdBy: userId, shop });

  return shop;
}
