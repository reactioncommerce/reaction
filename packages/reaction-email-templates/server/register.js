const pkg = ReactionCore.registerPackage({
  label: "Email",
  name: "reaction-email-templates",
  icon: "fa fa-envelope-square",
  autoEnable: true,
  settings: {
    name: "Send email notifications to customers"
  },
  registry: [{
    provides: "dashboard",
    label: "Email",
    description: "Send email notifications to customers",
    icon: "fa fa-envelope-square",
    priority: 4,
    container: "core"
  }]
});

// Make package name global accessible
PKG_NAME = pkg.name;
