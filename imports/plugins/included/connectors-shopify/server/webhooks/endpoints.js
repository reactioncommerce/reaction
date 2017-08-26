import crypto from "crypto";

import { Meteor } from "meteor/meteor";

import { Reaction } from "/server/api";
import { Products } from "/lib/collections";

// Shopify Shared Signature verification middleware
Reaction.Endpoints.add("post", "/webhooks/shopify/orders-create", function (req, res) {
  // We'll move the code that's in the orders-updated hook into here once it's functional
  // easier to iterate in that hook for now.
  Reaction.Endpoints.sendResponse(res);
});

Reaction.Endpoints.add("post", "/webhooks/shopify/orders-updated", function (req, res) {
  // ensure we have a shopId in the request query string
  if (!req || !req.query || !req.query.shopId) {
    throw new Meteor.Error("access-denied", "webhook requests must include a shopId");
  }

  // We'll verify the shop-domain in addition to the Reaction shopId
  const shopUrl = req.headers["x-shopify-shop-domain"];
  const shopName = shopUrl && shopUrl.split(".")[0];

  // Find the correct shopify package
  const shopifyPkg = Reaction.getPackageSettingsWithOptions({
    "shopId": req.query.shopId,
    "name": "reaction-connectors-shopify",
    "settings.shopName": shopName
  });

  // Fail if we can't find a shopify package
  if (!shopifyPkg || !shopifyPkg.settings) {
    throw new Meteor.Error("server-error", `No shopify package found for shop ${Reaction.getShopId()}`);
  }

  // Send response immediately
  Reaction.Endpoints.sendResponse(res);

  const hmac = crypto.createHmac("sha256", shopifyPkg.settings.sharedSecret).update(req.rawBody).digest("base64");
  if (hmac !== req.headers["x-shopify-hmac-sha256"]) {
    throw new Meteor.Error("access-denied", "Could not verify webhook request was from Shopify");
  }
  req.body.line_items.forEach((lineItem) => {
    const variantsWithShopifyId = Products.find({ shopifyId: lineItem.variant_id }).fetch();

    // iterate through the variants that match this shopifyId
    // return the one with the longest list of ancestors
    const productVariant = variantsWithShopifyId.reduce((shopifyVariant, variant) => {
      if (!shopifyVariant.ancestors || !Array.isArray(shopifyVariant.ancestors)) {
        return variant;
      }
      if (Array.isArray(variant.ancestors)) {
        if (variant.ancestors.length > shopifyVariant.ancestors.length) {
          return variant;
        }
      }
      return shopifyVariant;
    });

    // productVariant is the reaction variant we need to adjust inventory for.
    console.log("productVariant", productVariant);
  });
});
