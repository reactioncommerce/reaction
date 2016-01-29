/**
 * isCurrentLayout
 * @param {Object} layout - element of shops.layout array
 * @param {Object} setLayout - layout
 * @param {Object} setWorkflow - workflow
 * @returns {Object} layout - return object of template definitions for Blaze Layout
 */
selectLayout = (layout, setLayout, setWorkflow) => {
  const currentLayout = setLayout || "coreLayout";
  const currentWorkflow = setWorkflow || "coreLayout";
  if (layout.layout === currentLayout && layout.workflow === currentWorkflow && layout.enabled === true) {
    return layout;
  }
};

/**
 * renderLayout
 * sets and returns reaction layout structure
 * @param {Object} context - this router context
 * @param {String} layout - string of shop.layout.layout (defaults to coreLayout)
 * @param {String} workflow - string of shop.layout.workflow (defaults to coreLayout)
 * @param {String} options - layout.structure overrides
 * @returns {Object} layout - return object of template definitions for Blaze Layout
 */
renderLayout = (context, layout, workflow, options) => {
  const coreLayout = layout || "coreLayout";
  const coreWorkflow = workflow || "coreLayout";

  Tracker.autorun(function () {
    shopHandle = Meteor.subscribe("Shops");
    if (shopHandle.ready()) {
      const shop = ReactionCore.Collections.Shops.findOne();
      const newLayout = shop.layout.find((x) => selectLayout(x, coreLayout, coreWorkflow));
      const layoutToRender = Object.assign({}, newLayout.structure, options);
      // console.log("render coreLayout", layoutToRender);
      BlazeLayout.render(coreLayout, layoutToRender);
    }
  });
};

// define Router export
Router = FlowRouter;
ReactionRouter = Router;

// default not found route
Router.notFound = {
  action() {
    BlazeLayout.render("coreLayout", {
      template: "notFound"
    });
  }
};

// these are old iron:router methods
// that we'd like to warn are deprecated
Router.waitOn = () => {
  console.error("Deprecated. Router.waitOn is only supported for iron-router.")
};

Router.configure = () => {
  console.error("Deprecated. Router.configure is only supported for iron-router.")
};

Router.map = () => {
  console.error("Router.map is deprecated. Use ReactionCore.registerPackage to define routes.")
};
