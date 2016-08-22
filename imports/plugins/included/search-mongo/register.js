import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Mongo Search Engine",
  name: "reaction-mongo-search",
  icon: "fa fa-search",
  autoEnable: true,
  importPath: "/import/plugins/included/search-mongo/server",
  registry: [
    {
      provides: "searchEngine",
      label: "Mongo Search Engine",
      description: "Mongo-backed Search Engine"
    }
  ]
});
