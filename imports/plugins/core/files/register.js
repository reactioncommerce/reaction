import Reaction from "/imports/plugins/core/core/server/Reaction";
import xformFileCollectionsProductMedia from "./server/no-meteor/xforms/xformFileCollectionsProductMedia";

Reaction.registerPackage({
  label: "File Collections",
  name: "reaction-file-collections",
  icon: "fa fa-files-o",
  autoEnable: true,
  settings: {
    name: "File Collections"
  },
  functionsByType: {
    xformCatalogProductMedia: [xformFileCollectionsProductMedia]
  }
});
