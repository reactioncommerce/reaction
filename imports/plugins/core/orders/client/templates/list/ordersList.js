import moment from "moment";
import { Template } from "meteor/templating";
import { Orders, Shops } from "/lib/collections";
import OrderListSummary from "../../components/orderListSummary";
import orderListItemsContainer from "../../containers/orderListItemsContainer";

/**
 * dashboardOrdersList helpers
 *
 */
Template.dashboardOrdersList.helpers({
  orderStatus() {
    if (this.workflow.status === "coreOrderCompleted") {
      return true;
    }
  },
  orders(data) {
    if (data.hash.data) {
      return data.hash.data;
    }
    return Orders.find({}, {
      sort: {
        createdAt: -1
      },
      limit: 25
    });
  },
  orderAge() {
    return moment(this.createdAt).fromNow();
  },
  orderList() {
    let itemQty = 0;
    this.items.forEach(item => {
      itemQty += item.quantity;
    });
    return {
      component: OrderListSummary,
      billings: this.billing,
      itemQty
    };
  },
  orderListItems() {
    return {
      component: orderListItemsContainer,
      items: this.items
    };
  },
  shipmentTracking() {
    return this.shipping[0].shipmentMethod.tracking;
  },
  shopName() {
    const shop = Shops.findOne(this.shopId);
    return shop !== null ? shop.name : void 0;
  }
});
