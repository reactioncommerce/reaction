import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { InventoryBadge } from "../components/badge";
import { Reaction } from "/client/api";
import { ReactionProduct } from "/lib/api";

const composer = (props, onData) => {
  const { variant, soldOut } = props;
  const {
    inventoryManagement,
    inventoryPolicy,
    lowInventoryWarningThreshold,
    isSoldOut,
    isBackorder,
    isLowQuantity
  } = variant;
  let label = null;
  let i18nKeyLabel = null;
  let status = null;

  // Admins pull variants from the Products collection
  if (Reaction.hasPermission(["createProduct"], Reaction.getShopId())) {
    // Product collection variant
    if (inventoryManagement && !inventoryPolicy && variant.inventoryAvailableToSell === 0) {
      status = "info";
      label = "Backorder";
      i18nKeyLabel = "productDetail.backOrder";
    } else if (soldOut) {
      status = "danger";
      label = "Sold Out!";
      i18nKeyLabel = "productDetail.soldOut";
    } else if (inventoryManagement) {
      if (lowInventoryWarningThreshold >= variant.inventoryAvailableToSell) {
        status = "warning";
        label = "Limited Supply";
        i18nKeyLabel = "productDetail.limitedSupply";
      }
    }
  } else if (inventoryManagement) { // Customers pull variants from the Catalog collection
    // Catalog item variant
    if (isBackorder) {
      status = "info";
      label = "Backorder";
      i18nKeyLabel = "productDetail.backOrder";
    } else if (isSoldOut) {
      status = "danger";
      label = "Sold Out!";
      i18nKeyLabel = "productDetail.soldOut";
    } else if (isLowQuantity) {
      status = "warning";
      label = "Limited Supply";
      i18nKeyLabel = "productDetail.limitedSupply";
    }
  }

  onData(null, { ...props, label, i18nKeyLabel, status });
};

registerComponent("InventoryBadge", InventoryBadge, composeWithTracker(composer));

export default composeWithTracker(composer)(InventoryBadge);
