import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { Template } from "meteor/templating";
import { Blaze } from "meteor/blaze";
import { AutoForm } from "meteor/aldeed:autoform";
import { Reaction, i18next } from "/client/api";
import { Packages, Shipping } from "/lib/collections";

/*
 * Template shipping Helpers
 */
Template.shippingDashboardControls.events({
  "click [data-event-action=addShippingProvider]": function () {
    Reaction.showActionView({
      label: i18next.t("shipping.addShippingProvider"),
      template: "addShippingProvider"
    });
  }
});

Template.shippingSettings.onCreated(function () {
  // don't show unless we have services
  Reaction.hideActionView();
  this.autorun(() => {
    this.subscribe("Shipping");
  });
});

Template.shippingSettings.helpers({
  packageData() {
    return Packages.findOne({
      name: "reaction-shipping"
    });
  },
  shipping() {
    const instance = Template.instance();
    if (instance.subscriptionsReady()) {
      return Shipping.find({
        shopId: Reaction.getShopId()
      });
    }
  },
  selectedShippingProvider() {
    return Session.equals("selectedShippingProvider", true);
  }
});

Template.shippingProviderTable.onCreated(function () {
  this.autorun(() => {
    this.subscribe("Shipping");
  });
});

Template.shippingProviderTable.helpers({
  shipping() {
    const instance = Template.instance();
    if (instance.subscriptionsReady()) {
      return Shipping.find({
        shopId: Reaction.getShopId()
      });
    }
  }
});

/*
 * Template Shipping Events
 */

Template.shipping.events({
  "click"() {
    return Alerts.removeSeen();
  },
  "click [data-action=addShippingProvider]"() {
    Reaction.showActionView({
      label: i18next.t("shipping.addShippingProvider"),
      template: "addShippingProvider"
    });
  }
});

/*
 *  template editShippingMethod helpers
 */

Template.editShippingMethod.helpers({
  selectedMethodDoc() {
    const Doc = Session.get("updatedMethodObj") || Session.get("selectedMethodObj");
    if (Doc) {
      return Doc;
    }
  }
});


Template.afFormGroup_validLocales.helpers({
  afFieldInputAtts() {
    return _.extend({
      template: "bootstrap3"
    }, this.afFieldInputAtts);
  }
});

Template.afFormGroup_validRanges.helpers({
  afFieldInputAtts() {
    return _.extend({
      template: "bootstrap3"
    }, this.afFieldInputAtts);
  }
});

/*
 * template addShippingProvider events
 */
Template.editShippingProvider.events({
  "click [data-event-action=cancelUpdateShippingProvider]"(event) {
    event.preventDefault();
    Reaction.hideActionView();
  },
  "click [data-event-action=deleteShippingProvider]"(event) {
    event.preventDefault();
    // confirm delete
    Alerts.alert({
      title: i18next.t("shipping.removeShippingProvider"),
      type: "warning",
      showCancelButton: true,
      confirmButtonText: i18next.t("shipping.removeShippingProviderConfirm", { provider: this.provider.name })
    }, (isConfirm) => {
      if (isConfirm) {
        Meteor.call("shipping/provider/remove", this._id);
        Reaction.hideActionView();
      }
    });
  }
});

/*
 * template addShippingProvider events
 */
Template.addShippingProvider.events({
  "click [data-event-action=cancelAddShippingProvider]"(event) {
    event.preventDefault();
    Reaction.hideActionView();
  }
});

/*
 * template addShippingMethods events
 */
Template.addShippingMethod.events({
  "click .cancel"(event) {
    event.preventDefault();
    Reaction.toggleSession("selectedAddShippingMethod");
    Reaction.hideActionView();
  }
});

/*
 * Template shippingProviderTable Helpers
 */
Template.shippingProviderTable.helpers({
  shipping() {
    return Shipping.find();
  },
  selectedShippingMethod() {
    const session = Session.get("selectedShippingMethod");
    if (_.isEqual(this, session)) {
      return this;
    }
  },
  selectedAddShippingMethod() {
    const session = Session.get("selectedAddShippingMethod");
    if (_.isEqual(this, session)) {
      return this;
    }
  },
  selectedShippingProvider() {
    const session = Session.get("selectedShippingProvider");
    if (_.isEqual(this, session)) {
      return this;
    }
  }
});

/*
 * template shippingProviderTable events
 */
Template.shippingProviderTable.events({
  "click [data-event-action=editShippingMethod]"(event) {
    event.preventDefault();

    Reaction.showActionView({
      label: i18next.t("shipping.editShippingMethod"),
      data: this,
      template: "editShippingMethod"
    });

    Session.set("updatedMethodObj", "");
    Session.set("selectedMethodObj", this);
  },
  "click [data-event-action=editShippingProvider]"(event) {
    event.preventDefault();

    Reaction.showActionView({
      label: i18next.t("shipping.editShippingProvider"),
      data: this,
      template: "editShippingProvider"
    });
  },
  "click [data-event-action=deleteShippingMethod]"(event) {
    event.preventDefault();
    event.stopPropagation();

    // confirm delete
    Alerts.alert({
      title: i18next.t("shipping.removeShippingMethodTitle"),
      type: "warning",
      showCancelButton: true,
      confirmButtonText: i18next.t("shipping.removeShippingMethodConfirm", { method: this.name })
    }, (isConfirm) => {
      if (isConfirm) {
        Meteor.call("shipping/methods/remove", $(event.currentTarget).data("provider-id"), this);
        Reaction.hideActionView();
      }
    });
  },
  "click [data-event-action=addShippingMethod]"(event) {
    event.preventDefault();

    Reaction.showActionView({
      label: i18next.t("shipping.addShippingMethod"),
      template: "addShippingMethod"
    });
  }
});

/*
 * Autoform hooks
 * Because these are some convoluted forms
 */

AutoForm.hooks({
  "shipping-provider-add-form": {
    onSuccess() {
      Reaction.toggleSession("selectedShippingProvider");
      return Alerts.inline(i18next.t("shipping.shippingProviderSaved"), "success", {
        autoHide: true,
        placement: "shippingPackage"
      });
    }
  }
});

AutoForm.hooks({
  "shipping-method-add-form": {
    onSubmit(insertDoc, updateDoc, currentDoc) {
      const providerId = currentDoc ?  currentDoc._id : Template.instance().parentTemplate(4).$(".delete-shipping-method").data("provider-id");
      let error;
      try {
        Meteor.call("shipping/methods/add", insertDoc, providerId);
        this.done();
      } catch (_error) {
        error = _error;
        this.event.preventDefault();
        this.done(new Error("Submission failed"));
      }
      return error || false;
    },
    onSuccess() {
      Reaction.toggleSession("selectedAddShippingMethod");
      return Alerts.inline(i18next.t("shipping.shippingMethodRateAdded"), "success", {
        autoHide: true,
        placement: "shippingPackage"
      });
    }
  }
});

AutoForm.hooks({
  "shipping-method-edit-form": {
    onSubmit(insertDoc, updateDoc, currentDoc) {
      let error;
      // handling case where we are either inserting inline this providers first methods
      // or where we are adding additional methods to an existing array of provider methods in the admin panel.
      const providerId = Template.instance().parentTemplate(4).$(".delete-shipping-method").data("provider-id");
      try {
        _.extend(insertDoc, { _id: currentDoc._id });
        Meteor.call("shipping/methods/update", providerId, currentDoc._id, insertDoc);
        Session.set("updatedMethodObj", insertDoc);
        this.done();
      } catch (_error) {
        error = _error;
        this.done(new Error("Submission failed"));
      }
      return error || false;
    },
    onSuccess() {
      return Alerts.inline(i18next.t("shipping.shippingMethodRateUpdated"), "success", {
        autoHide: true,
        placement: "shippingPackage"
      });
    }
  }
});

Blaze.TemplateInstance.prototype.parentTemplate = function (levels = 1) {
  let view = Blaze.currentView;
  let numLevel = levels;
  while (view) {
    if (view.name.substring(0, 9) === "Template." && !numLevel--) {
      return view.templateInstance();
    }
    view = view.parentView;
  }
};
