import React from "react";
import PropTypes from "prop-types";
import { registerComponent } from "@reactioncommerce/reaction-components";
import CompletedOrderItem from "./completedOrderItem";

/**
 * @summary Displays the order breakdown for each Shop
 * @param {Object} props - React PropTypes
 * @property {String} shopName - The name of the shop
 * @property {Array} items - an array of individual items for this shop
 * @property {boolean} isProfilePage - Checks if current page is profile page
 * @return {Node} React node containing the break down of the order by Shop
 */
const CompletedShopOrders = ({ shopName, items, shippingMethod, isProfilePage }) => {
  const shippingName = isProfilePage ? (
    <span>
      <strong>
        {shippingMethod.label}
      </strong>{shippingMethod.deliveryDate && <span> - estimated delivery {shippingMethod.deliveryDate}</span>}
    </span>
  ) : `${shippingMethod.carrier} - ${shippingMethod.label}`;
  return (
    <div className="order-details-shop-breakdown">
      {/* This is the left side / main content */}
      <div className="order-details-info-box">
        <div className="store-detail-box">
          <span className="order-details-store-title">{shopName}</span>
          <span className="order-details-shipping-name">{shippingName}</span>
        </div>
      </div>
      <div className="order-details-info-box-topless">
        {items.map((item) => <CompletedOrderItem item={item} key={item._id} />)}
      </div>

      {/* This is the left side / main content */}
    </div>
  );
};

CompletedShopOrders.propTypes = {
  isProfilePage: PropTypes.bool,
  items: PropTypes.array,
  order: PropTypes.object,
  shippingMethod: PropTypes.object,
  shopName: PropTypes.string
};

registerComponent("CompletedShopOrders", CompletedShopOrders);

export default CompletedShopOrders;
