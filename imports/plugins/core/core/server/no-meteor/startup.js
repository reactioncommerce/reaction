import collectionIndex from "/imports/utils/collectionIndex";

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default function startup(context) {
  const { collections } = context;
  const { Packages } = collections;

  // Create indexes. We set specific names for backwards compatibility
  // with indexes created by the aldeed:schema-index Meteor package.
  collectionIndex(Packages, { "layout.layout": 1 }, { name: "c2_layout.$.layout" });
  collectionIndex(Packages, { "layout.structure.adminControlsFooter": 1 }, { name: "c2_layout.$.structure.adminControlsFooter" });
  collectionIndex(Packages, { "layout.structure.dashboardControls": 1 }, { name: "c2_layout.$.structure.dashboardControls" });
  collectionIndex(Packages, { "layout.structure.dashboardHeader": 1 }, { name: "c2_layout.$.structure.dashboardHeader" });
  collectionIndex(Packages, { "layout.structure.dashboardHeaderControls": 1 }, { name: "c2_layout.$.structure.dashboardHeaderControls" });
  collectionIndex(Packages, { "layout.structure.layoutFooter": 1 }, { name: "c2_layout.$.structure.layoutFooter" });
  collectionIndex(Packages, { "layout.structure.layoutHeader": 1 }, { name: "c2_layout.$.structure.layoutHeader" });
  collectionIndex(Packages, { "layout.structure.notFound": 1 }, { name: "c2_layout.$.structure.notFound" });
  collectionIndex(Packages, { "layout.structure.template": 1 }, { name: "c2_layout.$.structure.template" });
  collectionIndex(Packages, { name: 1 }, { name: "c2_name" });
  collectionIndex(Packages, { "registry.name": 1 }, { name: "c2_registry.$.name" });
  collectionIndex(Packages, { "registry.provides": 1 }, { name: "c2_registry.$.provides" });
  collectionIndex(Packages, { "registry.route": 1 }, { name: "c2_registry.$.route" });
  collectionIndex(Packages, { shopId: 1 }, { name: "c2_shopId" });
}
