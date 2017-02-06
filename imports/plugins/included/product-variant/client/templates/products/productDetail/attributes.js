import { ReactionProduct } from "/lib/api";
import { Meteor } from "meteor/meteor";
import { Tracker } from "meteor/tracker";
import { Template } from "meteor/templating";

/**
 * metaComponent helpers
 */

Template.metaComponent.helpers({
  buttonProps() {
    const currentData = Template.currentData();

    return {
      icon() {
        if (currentData.createNew) {
          return "plus";
        }

        return "times-circle";
      },
      onClick() {
        if (!currentData.createNew) {
          const productId = ReactionProduct.selectedProductId();
          Meteor.call("products/removeMetaFields", productId, currentData);
        }
      }
    };
  }
});


Template.metaComponent.events({
  "change input": function (event) {
    const productId = ReactionProduct.selectedProductId();
    const updateMeta = {
      key: Template.instance().$(event.currentTarget).parent().children(".metafield-key-input").val(),
      value: Template.instance().$(event.currentTarget).parent().children(".metafield-value-input").val()
    };

    if (this.key) {
      const index = Template.instance().$(event.currentTarget).closest(".metafield-list-item").index();
      Meteor.call("products/updateMetaFields", productId, updateMeta, index);
      Template.instance().$(event.currentTarget).animate({
        backgroundColor: "#e2f2e2"
      }).animate({
        backgroundColor: "#fff"
      });
      return Tracker.flush();
    }

    if (updateMeta.value && !updateMeta.key) {
      Template.instance().$(event.currentTarget).parent().children(".metafield-key-input").val("").focus();
    }
    if (updateMeta.key && updateMeta.value) {
      Meteor.call("products/updateMetaFields", productId, updateMeta);
      Tracker.flush();
      Template.instance().$(event.currentTarget).parent().children(".metafield-key-input").val("").focus();
      return Template.instance().$(event.currentTarget).parent().children(".metafield-value-input").val("");
    }
  }
});
