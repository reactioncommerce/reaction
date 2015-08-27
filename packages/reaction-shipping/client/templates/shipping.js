/*
 * Template shipping Helpers
 */
Template.shippingSettings.helpers({
  packageData: function() {
    return ReactionCore.Collections.Packages.findOne({
      name: "reaction-shipping"
    });
  },
  shipping: function() {
    return ReactionCore.Collections.Shipping.find();
  },
  selectedShippingProvider: function() {
    return Session.equals("selectedShippingProvider", true);
  }
});


/*
 * Template Shipping Events
 */

Template.shippingSettings.events({
  'click': function() {
    return Alerts.removeSeen();
  },
  'click .add-shipping-provider': function(event, template) {
    return toggleSession("selectedShippingProvider");
  }
});


/*
 * template addShippingMethod Helpers
 */

Template.addShippingMethod.helpers({
  shipping: function() {
    return ReactionCore.Collections.Shipping.find();
  }
});

Template.afFormGroup_validLocales.helpers({
  afFieldInputAtts: function() {
    return _.extend({
      template: 'bootstrap3'
    }, this.afFieldInputAtts);
  }
});

Template.afFormGroup_validRanges.helpers({
  afFieldInputAtts: function() {
    return _.extend({
      template: 'bootstrap3'
    }, this.afFieldInputAtts);
  }
});


/*
 * template addShippingProvider events
 */

 Template.shippingSettingsNav.events({
  'click [data-action=addShippingProvider]': function(event, template) {
    event.preventDefault();
    toggleSession("selectedShippingProvider");
    console.log("poop?")
  }
});



Template.editShippingMethod.events({
  'click .cancel': function(event, template) {
    toggleSession("selectedShippingMethod");
    return event.preventDefault();
  }
});


/*
 * template addShippingProvider events
 */

Template.updateShippingProvider.events({
  'click .cancel': function(event, template) {
    toggleSession("selectedShippingProvider");
    return event.preventDefault();
  }
});


/*
 * template addShippingProvider events
 */

Template.addShippingProvider.events({
  'click .cancel': function(event, template) {
    toggleSession("selectedShippingProvider");
    return event.preventDefault();
  }
});


/*
 * template addShippingMethods events
 */

Template.addShippingMethod.events({
  'click .cancel': function(event, template) {
    toggleSession("selectedAddShippingMethod");
    return event.preventDefault();
  }
});


/*
 * Template shippingProviderTable Helpers
 */

Template.shippingProviderTable.helpers({
  shipping: function() {
    return ReactionCore.Collections.Shipping.find();
  },
  selectedShippingMethod: function(item) {
    var session;
    session = Session.get("selectedShippingMethod");
    if (_.isEqual(this, session)) {
      return this;
    }
  },
  selectedAddShippingMethod: function() {
    var session;
    session = Session.get("selectedAddShippingMethod");
    if (_.isEqual(this, session)) {
      return this;
    }
  },
  selectedShippingProvider: function() {
    var session;
    session = Session.get("selectedShippingProvider");
    if (_.isEqual(this, session)) {
      return this;
    }
  }
});


/*
 * template shippingProviderTable events
 */

Template.shippingProviderTable.events({
  'click .edit-shipping-method': function(event, template) {
    var session;
    session = Session.get("selectedShippingMethod");
    if (_.isEqual(this, session)) {
      return Session.set("selectedShippingMethod", false);
    } else {
      return Session.set("selectedShippingMethod", this);
    }
  },
  'click .edit-shipping-provider': function(event, template) {
    return toggleSession("selectedShippingProvider", this);
  },
  'click #delete-shipping-method': function(event, template) {
    if (confirm("Are you sure you want to delete " + this.name)) {
      Meteor.call("removeShippingMethod", $(event.currentTarget).data('provider-id'), this);
      return Alerts.add("Shipping method deleted.", "success", {
        autoHide: true,
        placement: "shippingPackage"
      });
    } else {
      event.preventDefault();
      event.stopPropagation();
    }
  },
  'click #add-shipping-method': function(event, template) {
    var session;
    session = Session.get("selectedAddShippingMethod");
    if (_.isEqual(this, session)) {
      return Session.set("selectedAddShippingMethod", false);
    } else {
      return Session.set("selectedAddShippingMethod", this);
    }
  }
});


/*
 * Autoform hooks
 * Because these are some convoluted forms
 */

AutoForm.hooks({
  "shipping-provider-add-form": {
    onSuccess: function(operation, result, template) {
      toggleSession("selectedShippingProvider");
      return Alerts.add("Shipping provider saved.", "success", {
        autoHide: true,
        placement: "shippingPackage"
      });
    }
  }
});

AutoForm.hooks({
  "shipping-method-add-form": {
    onSubmit: function(insertDoc, updateDoc, currentDoc) {
      var error;
      try {
        Meteor.call("addShippingMethod", insertDoc, currentDoc._id || currentDoc.id);
        this.done();
      } catch (_error) {
        error = _error;
        this.done(new Error("Submission failed"));
      }
      return false;
    },
    onSuccess: function(operation, result, template) {
      toggleSession("selectedAddShippingMethod");
      return Alerts.add("Shipping method rate added.", "success", {
        autoHide: true,
        placement: "shippingPackage"
      });
    }
  }
});

AutoForm.hooks({
  "shipping-method-edit-form": {
    onSubmit: function(doc) {
      var error;
      try {
        Meteor.call("updateShippingMethods", Template.parentData(2)._id, Template.parentData(1), doc);
        this.done();
      } catch (_error) {
        error = _error;
        this.done(new Error("Submission failed"));
      }
      return false;
    },
    onSuccess: function(operation, result, template) {
      return Alerts.add("Shipping method rate updated.", "success", {
        autoHide: true,
        placement: "shippingPackage"
      });
    }
  }
});
