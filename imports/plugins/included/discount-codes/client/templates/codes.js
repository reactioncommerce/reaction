import { Template } from "meteor/templating";
import { Cart } from "/lib/collections";
import DiscountList from "/imports/plugins/core/discounts/client/components/list";
import "./codes.html";

Template.discountCodesCheckout.helpers({
  DiscountList() {
    return DiscountList;
  },
  cartId() {
    return Cart.findOne()._id;
  }
});
