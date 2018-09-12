import Reaction from "/imports/plugins/core/core/server/Reaction";
import mutations from "./server/no-meteor/mutations";
import queries from "./server/no-meteor/queries";

Reaction.registerPackage({
  label: "Catalog",
  name: "reaction-catalog",
  icon: "fa fa-book",
  autoEnable: true,
  mutations,
  queries,
  settings: {
    name: "Catalog"
  }
});
