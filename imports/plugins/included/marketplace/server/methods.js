import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Reaction } from "/lib/api";
import { Shops, Packages } from "/lib/collections";
import { SHOP_WORKFLOW_STATUS_ACTIVE, SHOP_WORKFLOW_STATUS_DISABLED } from "../lib/constants";

const status = [
  SHOP_WORKFLOW_STATUS_ACTIVE,
  SHOP_WORKFLOW_STATUS_DISABLED
];

export function marketplaceUpdateShopWorkflow(shopId, workflowStatus) {
  check(shopId, String);
  check(workflowStatus, String);

  if (shopId === Reaction.getPrimaryShopId()) {
    throw new Meteor.Error("access-denied", "Cannot change shop status");
  }

  if (!Reaction.hasPermission("admin", this.userId, Reaction.getPrimaryShopId())) {
    throw new Meteor.Error("access-denied", "Cannot change shop status");
  }

  if (status.includes(workflowStatus)) {
    return Shops.update({
      _id: shopId
    }, {
      $set: {
        "workflow.status": workflowStatus
      }
    }, function (error) {
      if (error) {
        throw new Meteor.Error("server-error", error.message);
      }
    });
  }

  throw new Meteor.Error("server-error", "Workflow status could not be updated, should be 'active' or 'disabled'");
}

/**
 * updateShopPackageStatus
 * @summary
 * @param {string} packageName -
 * @param {boolean} status -
 * @param {string} shopId -
 * @return {boolean} -
 */
function updateShopPackageStatus(packageName, pkgStatus, shopId) {
  check(packageName, String);
  check(pkgStatus, Boolean);
  check(shopId, String);

  if (shopId === Reaction.getPrimaryShopId()) {
    throw new Meteor.Error("access-denied", "Cannot change shop status");
  }

  if (!Reaction.hasPermission("admin", this.userId, Reaction.getPrimaryShopId())) {
    throw new Meteor.Error("access-denied", "Cannot change shop status");
  }

  return Packages.update({
    shopId,
    name: packageName
  }, {
    $set: { enabled: pkgStatus }
  });
}

Meteor.methods({
  "marketplace/updateShopWorkflow": marketplaceUpdateShopWorkflow,
  "marketplace/updatePackageStatus": updateShopPackageStatus
});
