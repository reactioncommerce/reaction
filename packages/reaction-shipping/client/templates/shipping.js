/*
 * Template shipping Helpers
 */
Template.shippingDashboardControls.events({
  "click [data-event-action=addShippingProvider]": function () {
    ReactionCore.showActionView({
      label: "Add Shipping Provider",
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
    return ReactionCore.Collections.Packages.findOne({
      name: "reaction-shipping"
    });
  },
  shipping() {
    const instance = Template.instance();
    if (instance.subscriptionsReady()) {
      return ReactionCore.Collections.Shipping.find({
        shopId: ReactionCore.getShopId()
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
      return ReactionCore.Collections.Shipping.find({
        shopId: ReactionCore.getShopId()
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

    Session.set("updatedMethodObj", "");
    Session.set("selectedMethodObj", this);
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
    onSubmit(insertDoc, updateDoc, currentDoc) {
      let error;
      let providerId = Template.instance().parentTemplate(4).$(".delete-shipping-method").data("provider-id");
      try {
        _.extend(insertDoc, { _id: currentDoc._id });
        Meteor.call("updateShippingMethods", providerId, currentDoc, insertDoc);
        Session.set("updatedMethodObj", insertDoc);
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
