/* eslint camelcase: 0 */
import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Search",
  name: "reaction-search",
  icon: "fa fa-search",
  autoEnable: true,
  settings: {
  },
  registry: [
    // Dashboard card
    {
      provides: "dashboard",
      label: "Search",
      description: "Search",
      icon: "fa fa-search",
      priority: 2,
      container: "core"
    }
  ]
});

