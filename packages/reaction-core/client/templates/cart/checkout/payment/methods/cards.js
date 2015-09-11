/**
 * corePaymentMethods helpers
 *
 * app details defaults the icon and label to the package dashboard settings
 * but you can override by setting in the package registry
 * eventually admin editable as well.
 * label is also translated with checkoutPayment.{{app name}}.label
 */
Template.corePaymentMethods.helpers({
  isOpen: function(current) {
    if (current.priority === 0) {
      return "in";
    }
  },
  appDetails: function(current) {
    var app, registry, self, _i, _len, _ref;
    self = this;
    if (!(this.icon && this.label)) {
      app = ReactionCore.Collections.Packages.findOne(this.packageId);
      _ref = app.registry;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        registry = _ref[_i];
        if (!(registry.provides === 'dashboard')) {
          continue;
        }
        self.icon = registry.icon;
        self.label = registry.label;
      }
    }
    return self;
  }
});
