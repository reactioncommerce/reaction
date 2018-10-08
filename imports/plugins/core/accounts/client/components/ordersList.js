import React, { Component } from "react";
import PropTypes from "prop-types";
import CompletedOrder from "../../../checkout/client/components/completedOrder";

/**
 * @summary React component to display an array of completed orders
 * @memberof Accounts
 * @extends {Component}
 * @property {Array} allOrdersInfo - array of orders
 * @property {Boolean} isProfilePage - Profile or non-profile page
 */
class OrdersList extends Component {
  static propTypes = {
    allOrdersInfo: PropTypes.arrayOf(PropTypes.shape({
      orderId: PropTypes.string.isRequired,
      order: PropTypes.object,
      paymentMethods: PropTypes.array
    })),
    isProfilePage: PropTypes.bool
  }

  render() {
    const { allOrdersInfo, isProfilePage } = this.props;

    if (allOrdersInfo) {
      return (
        <div>
          {allOrdersInfo.map((order) => (
            <CompletedOrder
              key={order.orderId}
              order={order.order}
              paymentMethods={order.paymentMethods}
              isProfilePage={isProfilePage}
            />
          ))}
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
