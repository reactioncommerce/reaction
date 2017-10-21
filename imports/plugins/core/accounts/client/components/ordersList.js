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
    handleDisplayMedia: PropTypes.func
  }
  render() {
    const { allOrdersInfo, handleDisplayMedia } = this.props;
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
            />
          );
        })}
      </div>
    );
  }
}

export default OrdersList;
