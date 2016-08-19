/* eslint camelcase: 0 */
import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Mongo Search Engine",
  name: "reaction-mongo-search",
  icon: "fa fa-search",
  autoEnable: true,
  settings: {
  },
  registry: [
    {
      provides: "searchEngine",
      label: "Mongo Search Engine",
      description: "Mongo-backed Search Engine"
    }
  ]
});


