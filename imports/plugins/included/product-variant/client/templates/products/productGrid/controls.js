import { Session } from "meteor/session";
import { Template } from "meteor/templating";
import { ReactiveDict } from "meteor/reactive-dict";
import { IconButton } from "/imports/plugins/core/ui/client/components";

Template.gridControls.onCreated(function () {
  this.state = new ReactiveDict();

  this.autorun(() => {
    if (this.data.product) {
      const selectedProducts = Session.get("productGrid/selectedProducts");
      const isSelected = _.isArray(selectedProducts) ? selectedProducts.indexOf(this.data.product._id) >= 0 : false;

      this.state.set("isSelected", isSelected);
    }
  });
});

Template.gridControls.onRendered(function () {
  return this.$("[data-toggle='tooltip']").tooltip({
    position: "top"
  });
});

Template.gridControls.helpers({
  checked: function () {
    return Template.instance().state.equals("isSelected", true);
  },

  isVisible() {
    const currentData = Template.currentData();
    return currentData && currentData.product && currentData.product.isVisible;
  },

  hasChanges() {
    const { product } = Template.currentData();

    if (product.__draft) {
      return true;
    }

    return false;
  },

  VisibilityButton() {
    return {
      component: IconButton,
      icon: "",
      onIcon: "",
      status: "info"
    };
  }
});
