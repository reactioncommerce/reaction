import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { InventoryBadge } from "../components/badge";
import { ReactionProduct } from "/lib/api";

const composer = (props, onData) => {
  const { variant, soldOut } = props;
  const { inventoryManagement, inventoryPolicy, lowInventoryWarningThreshold } = variant;
  const inventoryQuantity = ReactionProduct.getVariantQuantity(variant);
  let label = null;
  let i18nKeyLabel = null;
  let status = null;
  // TODO: update this to use Catalog API.
  if (inventoryManagement && !inventoryPolicy && inventoryQuantity === 0) {
    status = "info";
    label = "Backorder";
    i18nKeyLabel = "productDetail.backOrder";
  } else if (soldOut) {
    status = "danger";
    label = "Sold Out!";
    i18nKeyLabel = "productDetail.soldOut";
  } else if (inventoryManagement) {
    if (lowInventoryWarningThreshold >= inventoryQuantity) {
      status = "warning";
      label = "Limited Supply";
      i18nKeyLabel = "productDetail.limitedSupply";
    }
  }

  onData(null, { ...props, label, i18nKeyLabel, status });
};

registerComponent("InventoryBadge", InventoryBadge, composeWithTracker(composer));

export default composeWithTracker(composer)(InventoryBadge);
