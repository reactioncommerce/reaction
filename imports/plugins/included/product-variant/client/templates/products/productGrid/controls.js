import { Session } from "meteor/session";
import { Template } from "meteor/templating";

Template.gridControls.onRendered(function () {
  return this.$("[data-toggle='tooltip']").tooltip({
    position: "top"
  });
});

Template.gridControls.helpers({
  checked: function () {
    const selectedProducts = Session.get("productGrid/selectedProducts");
    return _.isArray(selectedProducts) ? selectedProducts.indexOf(this._id) >= 0 : false;
  }
});
