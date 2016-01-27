/**
 * isCurrentLayout
 * @param {Object} element - element of shops.layout array
 * @returns {Object} layout - return object of template definitions for Blaze Layout
 */
function isCurrentLayout(element) {
  if (element.layout === "coreLayout" && element.workflow === "coreLayout") {
    return element.layout;
  }
}

/**
 * getLayout
 * sets and returns reaction layout structure
 * layout = {
 * template: "products",
 * layoutHeader: "layoutHeader",
 * layoutFooter: "layoutFooter",
 * loadingTemplate: "loading",
 * notFoundTemplate: "notFound",
 * unauthorized: "unauthorized",
 * printLayout: "printLayout",
 * dashboardControls: "dashboardControls"
 * };
 * @returns {Object} layout - return object of template definitions for Blaze Layout
 */
fetchCoreLayout = function () {
  let layout;
  Tracker.autorun(function () {
    shopHandle = Meteor.subscribe("Shops");
    if (shopHandle.ready()) {
      let shop = ReactionCore.Collections.Shops.findOne();
      if (shop) {
        Session.set("ReactionLayout", shop.layout.find(isCurrentLayout).structure);
      }
    }
  });
  return layout;
};

//
// define Router export
//

Router = FlowRouter;
Router.triggers.enter([fetchCoreLayout]);
//
// default not found route
//

Router.notFound = {
  action() {
    BlazeLayout.render("coreLayout", {
      template: "notFound"
    });
  }
};
