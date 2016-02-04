/*
 * Template shipping Helpers
 */
Meteor.subscribe("Shipping");

Template.shippingDashboardControls.events({
  "click [data-event-action=addShippingProvider]": function () {
    ReactionCore.showActionView({
      label: "Add Shipping Provider",
      template: "addShippingProvider"
    });
  }
});

Template.shippingSettings.helpers({
  packageData() {
    return ReactionCore.Collections.Packages.findOne({
      name: "reaction-shipping"
    });
  },
  shipping() {
    return ReactionCore.Collections.Shipping.find({
      shopId: ReactionCore.getShopId()
    });
  },
  selectedShippingProvider() {
    return Session.equals("selectedShippingProvider", true);
  }
});

Template.shippingProviderTable.helpers({
  shipping() {
    return ReactionCore.Collections.Shipping.find({
      shopId: ReactionCore.getShopId()
    });
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
    ReactionCore.showActionView({
      label: "Add Shipping Provider",
      template: "addShippingProvider"
    });
  }
});


/*
 * template addShippingMethod Helpers
 */

Template.addShippingMethod.helpers({
  shipping() {
    return ReactionCore.Collections.Shipping.find();
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
    ReactionCore.hideActionView();
  }
});

/*
 * template addShippingProvider events
 */
Template.addShippingProvider.events({
  "click [data-event-action=cancelAddShippingProvider]"(event) {
    event.preventDefault();
    ReactionCore.hideActionView();
  }
});

/*
 * template addShippingMethods events
 */
Template.addShippingMethod.events({
  "click .cancel"(event) {
    event.preventDefault();
    toggleSession("selectedAddShippingMethod");
  }
});


/*
 * Template shippingProviderTable Helpers
 */
Template.shippingProviderTable.helpers({
  shipping() {
    return ReactionCore.Collections.Shipping.find();
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

    ReactionCore.showActionView({
      label: "Edit Shipping Method",
      data: this,
      template: "editShippingMethod"
    });
  },
  "click [data-event-action=editShippingProvider]"(event) {
    event.preventDefault();

    ReactionCore.showActionView({
      label: "Edit Shipping Provider",
      data: this,
      template: "editShippingProvider"
    });
  },
  "click [data-event-action=deleteShippingMethod]"(event) {
    event.preventDefault();
    event.stopPropagation();

    Alerts.alert({
      title: "Remove Shipping Method",
      text: `Are you sure you want to delete ${this.name}`,
      type: "warning",
      closeOnConfirm: false
    },
    () => {
      Meteor.call("removeShippingMethod", $(event.currentTarget).data("provider-id"), this);
      Alerts.alert("Shipping method deleted.", "", "success");
    });
  },
  "click [data-event-action=addShippingMethod]"(event) {
    event.preventDefault();

    ReactionCore.showActionView({
      label: "Add Shipping Method",
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
      toggleSession("selectedShippingProvider");
      return Alerts.inline("Shipping provider saved.", "success", {
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
      toggleSession("selectedAddShippingMethod");
      return Alerts.inline("Shipping method rate added.", "success", {
        autoHide: true,
        placement: "shippingPackage"
      });
    }
  }
});

AutoForm.hooks({
  "shipping-method-edit-form": {
    onSubmit(doc) {
      let error;
      try {
        Meteor.call("updateShippingMethods", Template.parentData(2)._id, Template.parentData(1), doc);
        this.done();
      } catch (_error) {
        error = _error;
        this.done(new Error("Submission failed"));
      }
      return error || false;
    },
    onSuccess() {
      return Alerts.inline("Shipping method rate updated.", "success", {
        autoHide: true,
        placement: "shippingPackage"
      });
    }
  }
});
