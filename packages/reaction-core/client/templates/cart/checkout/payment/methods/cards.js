/**
 * corePaymentMethods helpers
 *
 * app details defaults the icon and label to the package dashboard settings
 * but you can override by setting in the package registry
 * eventually admin editable as well.
 * label is also translated with checkoutPayment.{{app name}}.label
 */
Template.corePaymentMethods.helpers({
  isOpen: function (current) {
    if (current.priority === "0") {
      return "in";
    }
  },
  appDetails: function () {
    let self = this;
    if (!(this.icon && this.label)) {
      let app = ReactionCore.Collections.Packages.findOne(this.packageId);
      for (let registry of app.registry) {
        if (!(registry.provides === "dashboard")) {
          continue;
        }
        self.icon = registry.icon;
        self.label = registry.label;
      }
    }
    return self;
  }
});
