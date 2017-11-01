import React, { Component } from "react";
import PropTypes from "prop-types";
import CompletedOrder from "../../../checkout/client/components/completedOrder";

/**
 * @summary React component to display an array of completed orders
 * @class OrdersList
 * @extends {Component}
 * @property {Array} allOrdersInfo - array of orders
 * @property {Function} handeleDisplayMedia - function to display order image
 */
class OrdersList extends Component {
  static propTypes = {
    allOrdersInfo: PropTypes.array,
    handleDisplayMedia: PropTypes.func,
    isProfilePage: PropTypes.bool
  }

  render() {
    const { allOrdersInfo, handleDisplayMedia } = this.props;

    if (allOrdersInfo) {
      return (
        <div>
          {allOrdersInfo.map((order) => {
            const orderKey = order.orderId;
            return (
              <CompletedOrder
                key={orderKey}
                shops={order.shops}
                order={order.order}
                orderId={order.orderId}
                orderSummary={order.orderSummary}
                paymentMethods={order.paymentMethods}
                productImages={order.productImages}
                handleDisplayMedia={handleDisplayMedia}
                isProfilePage={this.props.isProfilePage}
              />
            );
          })}
        </div>
      );
    }
    return (
      <div className="alert alert-info">
        <span data-i18n="cartCompleted.noOrdersFound">No orders found.</span>
      </div>
    );
  }
}

export default OrdersList;
