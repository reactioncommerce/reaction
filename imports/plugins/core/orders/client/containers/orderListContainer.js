import React, { Component, PropTypes } from "react";
import { Orders } from "/lib/collections";
import OrderList from "../components/orderList";

class OrderListContainer extends Component {
  static propTypes = {
    userOrders: PropTypes.arrayOf(Object)
  }
  render() {
    const { userOrders } = this.props;
    const orders = Orders.find({}, {
      sort: {
        createdAt: -1
      },
      limit: 25
    }).fetch();
    if (userOrders) {
      return (
        <div>
          {userOrders.map(order => {
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
