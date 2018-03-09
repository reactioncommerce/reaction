import React, { Component } from "react";
import PropTypes from "prop-types";
import CompletedOrder from "../../../checkout/client/components/completedOrder";

/**
 * @summary React component to display an array of completed orders
 * @memberof Accounts
 * @extends {Component}
 * @property {Array} allOrdersInfo - array of orders
 * @property {Function} handeleDisplayMedia - function to display order image
 * @property {Boolean} isProfilePage - Profile or non-profile page
 */
class OrdersList extends Component {
  static propTypes = {
    allOrdersInfo: PropTypes.array,
    isProfilePage: PropTypes.bool
  }

  render() {
    const { allOrdersInfo } = this.props;

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
                orderSummary={order.orderSummary}
                paymentMethods={order.paymentMethods}
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
