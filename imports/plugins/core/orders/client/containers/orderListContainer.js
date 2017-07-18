import React, { Component, PropTypes } from "react";
import { Orders } from "/lib/collections";
import OrderList from "../components/orderList";

class OrderListContainer extends Component {
  static propTypes = {
    account: PropTypes.bool,
    userOrders: PropTypes.object
  }
  render() {
    const { userOrders, account } = this.props;
    const orders = Orders.find({}, {
      sort: {
        createdAt: -1
      },
      limit: 25
    }).fetch();
    if (userOrders && account) {
      return (
        <div>
          {userOrders.map(order => {
            return (
              <OrderList
                key={order._id}
                order={order}
                account={account}
              />
            );
          })}
        </div>
      );
    }
    return (
      <div>
        {orders.map(order => {
          return (
            <OrderList
              key={order._id}
              order={order}
            />
          );
        })}
      </div>
    );
  }
}

export default OrderListContainer;
