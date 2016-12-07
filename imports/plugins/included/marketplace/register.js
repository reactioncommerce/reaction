import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Marketplace",
  name: "reaction-marketplace",
  icon: "fa fa-globe",
  autoEnable: true,
  settings: {
    name: "Marketplace",
    public: {
      allowGuestSellers: true
    }
  },
  registry: [
    // page

    // Dashboard card
    {
      provides: "dashboard",
      label: "Marketplace",
      description: "Allow users to become sellers, switch shops UI",
      icon: "fa fa-globe",
      priority: 2,
      container: "marketplace",
      permissions: [{
        label: "Marketplace",
        permission: "dashboard/marketplace"
      }]
    }
  ]
});

