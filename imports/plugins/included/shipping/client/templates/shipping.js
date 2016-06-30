import { Reaction, i18next } from "/client/api";
import { Packages, Shipping } from "/lib/collections";
import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { Template } from "meteor/templating";
import { Blaze } from "meteor/blaze";

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
 * template addShippingMethod Helpers
 */

Template.addShippingMethod.helpers({
  shipping() {
    return Shipping.find();
  }
});


/*
 *  template editShippingMethod helpers
 */

Template.editShippingMethod.helpers({
  selectedMethodDoc() {
    Doc = Session.get("updatedMethodObj") || Session.get("selectedMethodObj");
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
    let session = Session.get("selectedShippingMethod");
    if (_.isEqual(this, session)) {
      return this;
    }
  },
  selectedAddShippingMethod() {
    let session = Session.get("selectedAddShippingMethod");
    if (_.isEqual(this, session)) {
      return this;
    }
  },
  selectedShippingProvider() {
    let session = Session.get("selectedShippingProvider");
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

    Alerts.alert({
      title: i18next.t("shipping.removeShippingMethodTitle"),
      text: i18next.t("shipping.removeShippingMethodConfirm", { method: this.name }),
      type: "warning",
      closeOnConfirm: false
    },
      () => {
        Meteor.call("removeShippingMethod", $(event.currentTarget).data("provider-id"), this);
        Alerts.alert(i18next.t("shipping.shippingMethodDeleted"), "", "success");
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
      let error;
      try {
        Meteor.call("addShippingMethod", insertDoc, currentDoc._id || currentDoc.id);
        this.done();
      } catch (_error) {
        error = _error;
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
      let providerId = Template.instance().parentTemplate(4).$(".delete-shipping-method").data("provider-id");
      try {
        _.extend(insertDoc, { _id: currentDoc._id });
        Meteor.call("updateShippingMethods", providerId, currentDoc._id, insertDoc);
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
