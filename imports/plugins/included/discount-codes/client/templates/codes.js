import { Template } from "meteor/templating";
import getCart from "/imports/plugins/core/cart/client/util/getCart";
import DiscountList from "/imports/plugins/core/discounts/client/components/list";
import "./codes.html";

Template.discountCodesCheckout.helpers({
  DiscountList() {
    return DiscountList;
  },
  cartId() {
    const { cart } = getCart();
    return cart && cart._id;
  }
});
