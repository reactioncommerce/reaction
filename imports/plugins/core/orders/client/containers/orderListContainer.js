import React, { Component, PropTypes } from "react";
import { Orders, Shops } from "/lib/collections";
import OrderList from "../components/orderList";

class OrderListContainer extends Component {
  static propTypes = {
    userOrders: PropTypes.arrayOf(Object)
  }
  handleShopName(order) {
    const shop = Shops.findOne(order.shopId);
    return shop !== null ? shop.name : void 0;
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
                shopName={this.handleShopName(order)}
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
              shopName={this.handleShopName(order)}
            />
          );
        })}
      </div>
    );
  }
}

export default OrderListContainer;
