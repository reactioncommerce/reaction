import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Search",
  name: "reaction-search",
  icon: "fa fa-search",
  autoEnable: true,
  settings: {
    products: {
      includes: {
        title: true,
        description: true,
        pageTitle: false,
        metafields: true,
        vendor: true
      },
      weights: {
        title: 10,
        description: 5,
        pageTitle: 3,
        metafields: 1,
        vendor: 4
      }
    }
  },
  registry: [
    // Dashboard card
    {
      provides: ["dashboard"],
      label: "Search",
      description: "Search",
      icon: "fa fa-search",
      priority: 2,
      container: "core"
    },
    // Settings Panel
    {
      label: "Search Settings",
      icon: "fa fa-search",
      route: "/dashboard/search",
      provides: ["settings"],
      container: "dashboard",
      template: "searchSettings"
    }
  ]
});
